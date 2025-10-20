export type Handler<Bindings> = (ctx: Context<Bindings>) => Response | Promise<Response>

type ExtractBindings<T> = T extends { Bindings: infer B } ? B : Record<string, unknown>

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

class HonoRequest {
  constructor(private readonly request: Request) {}

  header(name: string) {
    return this.request.headers.get(name)
  }

  text() {
    return this.request.text()
  }

  json<T = unknown>() {
    return this.request.json() as Promise<T>
  }
}

export interface Context<Bindings> {
  req: HonoRequest
  env: Bindings
  text: (body: string, status?: number) => Response
  json: (data: unknown, status?: number) => Response
}

export class Hono<AppEnv = { Bindings: Record<string, unknown> }> {
  private routes = new Map<string, Handler<ExtractBindings<AppEnv>>>()

  private on(method: Method, path: string, handler: Handler<ExtractBindings<AppEnv>>) {
    this.routes.set(`${method}:${path}`, handler)
    return this
  }

  get(path: string, handler: Handler<ExtractBindings<AppEnv>>) {
    return this.on('GET', path, handler)
  }

  post(path: string, handler: Handler<ExtractBindings<AppEnv>>) {
    return this.on('POST', path, handler)
  }

  put(path: string, handler: Handler<ExtractBindings<AppEnv>>) {
    return this.on('PUT', path, handler)
  }

  delete(path: string, handler: Handler<ExtractBindings<AppEnv>>) {
    return this.on('DELETE', path, handler)
  }

  patch(path: string, handler: Handler<ExtractBindings<AppEnv>>) {
    return this.on('PATCH', path, handler)
  }

  async fetch(request: Request, env: ExtractBindings<AppEnv>): Promise<Response> {
    const url = new URL(request.url)
    const key = `${request.method.toUpperCase()}:${url.pathname}`
    const handler = this.routes.get(key)
    if (!handler) {
      return new Response('Not Found', { status: 404 })
    }

    const ctx: Context<ExtractBindings<AppEnv>> = {
      req: new HonoRequest(request),
      env,
      text: (body, status = 200) => new Response(body, { status }),
      json: (data, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
    }

    return handler(ctx)
  }
}
