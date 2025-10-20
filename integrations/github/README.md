# Chitty GitHub App Worker

This package contains the Cloudflare Worker implementation and manifest for the Chitty GitHub App. Deploy it with `wrangler` after supplying the required secrets.

## Environment

Set the following secrets via `wrangler secret put` or your preferred mechanism:

- `GITHUB_APP_ID`
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_PRIVATE_KEY_PEM`
- `CHITTY_TENANT_SIGNING_KEY`

Optional plain variables:

- `INSTALLATION_RESOLVER_URL` (defaults to `https://api.chitty.cc/integrations/github/installations/resolve`)

## Storage bindings

Bind Cloudflare KV namespaces when available:

- `TOKEN_CACHE` – caches installation access tokens until 60 seconds before expiry.
- `DELIVERY_CACHE` – deduplicates webhook deliveries for 1 hour.
- `INSTALLATION_CACHE` – memoizes installation → tenant mappings returned by the resolver.

## Endpoints

- `POST /integrations/github/webhook` – verifies the webhook signature, resolves the tenant for the installation, and forwards the payload to the MCP dispatcher.
- `GET /integrations/github/check` – lightweight health check.

## GitHub API helpers

`createCheckRun` and `concludeCheckRun` demonstrate how to mint installation tokens, create an in-progress check, and conclude it after the MCP job completes.
