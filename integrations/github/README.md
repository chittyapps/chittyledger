# Chitty GitHub App Worker

This package contains the Cloudflare Worker implementation and manifest for the Chitty GitHub App. Deploy it with `wrangler` after supplying the required secrets.

## Environment

Set the following secrets via `wrangler secret put` or your preferred mechanism:

- `GITHUB_APP_ID`
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_PRIVATE_KEY_PEM`
- `CHITTY_TENANT_SIGNING_KEY`

Optional: bind a `TOKEN_CACHE` KV namespace to cache installation access tokens.

## Endpoints

- `POST /integrations/github/webhook` – verifies the webhook signature, resolves the tenant for the installation, and forwards the payload to the MCP dispatcher.
- `GET /integrations/github/check` – lightweight health check.

## GitHub API helpers

`createCheckRun` and `concludeCheckRun` demonstrate how to mint installation tokens, create an in-progress check, and conclude it after the MCP job completes.
