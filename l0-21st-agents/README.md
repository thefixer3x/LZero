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
npm run login
npm run deploy
```

`npm run deploy` builds `vortexai-l0` first, then deploys the `vortexai-l0-orchestrator` 21st agent.

## Useful Commands

```bash
# Deploy only this agent
npm run deploy

# Deploy all agent folders under ./agents
npm run deploy:all

# List configured env keys
npm run env:list

# View recent logs
npm run logs
```
