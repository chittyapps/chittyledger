import { Hono } from './hono'

export interface Env {
  GITHUB_APP_ID: string
  GITHUB_WEBHOOK_SECRET: string
  GITHUB_PRIVATE_KEY_PEM: string
  CHITTY_TENANT_SIGNING_KEY: string
  TOKEN_CACHE?: KVNamespace
}

const app = new Hono<{ Bindings: Env }>()

app.post('/integrations/github/webhook', async c => {
  const secret = c.env.GITHUB_WEBHOOK_SECRET
  const sig = c.req.header('X-Hub-Signature-256') ?? ''
  const deliveryId = c.req.header('X-GitHub-Delivery') ?? 'unknown'
  const event = c.req.header('X-GitHub-Event') ?? 'unknown'

  const body = await c.req.text()
  const valid = await verifyHmac256(body, secret, sig)
  if (!valid) {
    return c.text('sig mismatch', 401)
  }

  const payload = JSON.parse(body)
  const installationId: number | undefined = payload.installation?.id
  if (!installationId) {
    return c.text('no installation', 202)
  }

  const tenantId = await mapInstallationToTenant(installationId)

  await dispatchToMCP({
    tenantId,
    event,
    deliveryId,
    payload,
  })

  return c.text('ok')
})

app.get('/integrations/github/check', c => {
  return c.json({ ok: true })
})

export default app

async function verifyHmac256(body: string, secret: string, sigHeader: string) {
  if (!sigHeader.startsWith('sha256=')) {
    return false
  }

  const expected = await hmacSha256(secret, body)
  const provided = hexToBytes(sigHeader.slice(7))
  return timingSafeEqual(provided, expected)
}

async function hmacSha256(key: string, msg: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(msg))
  return new Uint8Array(signature)
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error('invalid hex input length')
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false
  }
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

function base64UrlEncode(data: Uint8Array) {
  let binary = ''
  data.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlEncodeJson(payload: object) {
  const json = JSON.stringify(payload)
  return base64UrlEncode(new TextEncoder().encode(json))
}

function normalizePem(pem: string) {
  return pem.replace(/\\n/g, '\n').replace(/\r/g, '')
}

async function importRsaPrivateKey(pem: string) {
  const normalized = normalizePem(pem).trim()
  const { type, data } = decodePem(normalized)
  const der = type === 'PRIVATE KEY' ? data.buffer : wrapPkcs1Key(data)

  return crypto.subtle.importKey(
    'pkcs8',
    der,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )
}

function decodePem(pem: string) {
  const match = /-----BEGIN ([^-]+)-----([\s\S]+?)-----END \1-----/m.exec(pem)
  if (!match) {
    throw new Error('invalid PEM format')
  }
  const type = match[1]
  const body = match[2].replace(/\s+/g, '')
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return { type, data: bytes }
}

function wrapPkcs1Key(pkcs1: Uint8Array) {
  const oid = new Uint8Array([0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00])
  const version = new Uint8Array([0x02, 0x01, 0x00])
  const privateKeyOctet = new Uint8Array(encodeOctetString(pkcs1))

  const innerLength = version.length + oid.length + privateKeyOctet.length
  const innerSequence = new Uint8Array([0x30, ...encodeLength(innerLength), ...version, ...oid, ...privateKeyOctet])

  const full = new Uint8Array([0x30, ...encodeLength(innerSequence.length), ...innerSequence])
  return full.buffer.slice(0)
}

function encodeOctetString(data: Uint8Array) {
  return [0x04, ...encodeLength(data.length), ...data]
}

function encodeLength(length: number) {
  if (length < 0x80) {
    return [length]
  }
  const bytes = []
  let value = length
  while (value > 0) {
    bytes.push(value & 0xff)
    value >>= 8
  }
  bytes.reverse()
  return [0x80 | bytes.length, ...bytes]
}

async function signRS256(payload: object, pem: string) {
  const header = { alg: 'RS256', typ: 'JWT' }
  const unsigned = `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}`
  const key = await importRsaPrivateKey(pem)
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`
}

async function mintAppJWT(appId: string, pem: string) {
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iat: now - 5,
    exp: now + 60,
    iss: appId,
  }
  return signRS256(claims, pem)
}

async function getInstallationToken(installationId: number, env: Env) {
  const cacheKey = `inst:${installationId}`
  const cached = await env.TOKEN_CACHE?.get(cacheKey)
  if (cached) {
    return cached
  }

  const jwt = await mintAppJWT(env.GITHUB_APP_ID, env.GITHUB_PRIVATE_KEY_PEM)
  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) {
    throw new Error(`token ${response.status}`)
  }

  const data = (await response.json()) as { token: string; expires_at: string }
  const ttl = Math.max(1, Math.floor((Date.parse(data.expires_at) - Date.now()) / 1000) - 60)
  await env.TOKEN_CACHE?.put(cacheKey, data.token, { expirationTtl: ttl })
  return data.token
}

export async function createCheckRun(
  env: Env,
  installationId: number,
  repo: { owner: string; name: string },
  sha: string
) {
  const token = await getInstallationToken(installationId, env)
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/check-runs`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      name: 'Chitty Compliance/CI',
      head_sha: sha,
      status: 'in_progress',
    }),
  })

  if (!response.ok) {
    throw new Error(`check-run ${response.status}`)
  }

  return response.json()
}

export async function concludeCheckRun(
  env: Env,
  installationId: number,
  repo: { owner: string; name: string },
  runId: number,
  success: boolean,
  summary: string
) {
  const token = await getInstallationToken(installationId, env)
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/check-runs/${runId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      status: 'completed',
      conclusion: success ? 'success' : 'failure',
      output: {
        title: 'Chitty Compliance/CI',
        summary,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`check-run ${response.status}`)
  }
}

async function dispatchToMCP(input: {
  tenantId: string
  event: string
  deliveryId: string
  payload: unknown
}) {
  await fetch('https://mcp.chitty.cc/tools/github.event.dispatch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Chitty-Tenant': input.tenantId,
    },
    body: JSON.stringify(input),
  })
}

async function mapInstallationToTenant(installationId: number) {
  return `tenant:${installationId}`
}
