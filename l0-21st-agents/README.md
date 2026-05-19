# VortexAI L0 21st Agents Workspace

This folder provides a dedicated 21st deployment workspace that sits side-by-side with:

- The CLI package in `apps/vortexai-l0`
- The landing app in `apps/vortexai-l0/L0-saas-index`

## Layout

```
l0-21st-agents/
  agents/
    vortexai-l0-orchestrator/
      index.ts
  package.json
```

## Quick Start

```bash
cd apps/vortexai-l0/l0-21st-agents
npm install
npm run check:l0
npm run login
npm run deploy
```

`npm run deploy` builds `vortexai-l0` first, then deploys the `vortexai-l0-orchestrator` 21st agent.

## End-to-End Runbook

### 1. Prove the local L0 package

```bash
cd apps/vortexai-l0/l0-21st-agents
npm install
npm run check:l0
```

This verifies that the 21st workspace can import `vortexai-l0/orchestrator` and run a sample orchestration query.

### 2. Authenticate the 21st CLI

```bash
npm run login
```

For a non-interactive shell, set `API_KEY_21ST` and run:

```bash
API_KEY_21ST=21st_sk_... npx @21st-sdk/cli login --api-key "$API_KEY_21ST"
```

The 21st CLI stores credentials in `~/.an/credentials`. Keep `API_KEY_21ST` out of committed files.

### 3. Deploy the agent

```bash
npm run deploy
```

This deploys only `agents/vortexai-l0-orchestrator`. To deploy every folder under `agents/`, use:

```bash
npm run deploy:all
```

### 4. Operate the deployment

```bash
npm run env:list
npm run logs
```

Use 21st env commands when the deployed agent needs hosted environment variables:

```bash
npx @21st-sdk/cli env set vortexai-l0-orchestrator LANONASIS_API_URL=https://api.lanonasis.com
npx @21st-sdk/cli env set vortexai-l0-orchestrator LANONASIS_API_KEY=...
```

## Auth Gateway Is a Separate Local Stack

The 21st deploy path does not require local `auth-gateway` to start. If you run the wider monorepo dev stack and see:

```text
Error: Invalid environment configuration
```

from `apps/onasis-core/services/auth-gateway/config/env.ts`, fix that service's `.env` first. The gateway currently requires real, valid values for:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL` or `SERVICE_ROLE_DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_AUTH_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` with at least 32 characters

You can validate only the gateway env parser without starting the server:

```bash
cd apps/onasis-core/services/auth-gateway
./node_modules/.bin/tsx -e "import('./config/env.ts').then(() => console.log('env ok'))"
```

Do not paste secret values into terminal output or docs; check only key presence and validation errors.

## Useful Commands

```bash
# Verify local package import and sample query
npm run check:l0

# Deploy only this agent
npm run deploy

# Deploy all agent folders under ./agents
npm run deploy:all

# List configured env keys
npm run env:list

# View recent logs
npm run logs
```
