# VortexAI L0: CLI + Dashboard + 21st Agent Coexistence

## Structure

vortexai-l0/ (root - CLI package)
├── src/                  # CLI source code
├── dist/                 # Compiled CLI (browser + node)
├── package.json          # CLI configuration
├── L0-saas-index/        # Dashboard (Next.js) - standalone subdirectory
│   ├── src/
│   ├── app/
│   ├── package.json
│   └── ...
├── l0-21st-agents/       # 21st agent deployment workspace
│   ├── agents/
│   │   └── vortexai-l0-orchestrator/
│   │       └── index.ts
│   └── package.json
├── examples/
└── docs/

## Key Points

- **L0-saas-index is NOT a git submodule** - just a regular directory
- **No embedded .git** - both tracked in main vortexai-l0 repo
- **Independent builds** - each has its own package.json and build process
- **Separate deployments** - CLI to npm, Dashboard to Vercel/Netlify, Agent to 21st

## Development

### CLI Only

```bash
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0
npm install
npm run dev      # Watch and compile
npm run build    # Build to dist/
```

### Dashboard Only

```bash
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0/L0-saas-index
npm install
npm run dev      # Dev server on localhost:3000
```

### 21st Agent Only

```bash
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0/l0-21st-agents
npm install
npm run login
npm run deploy   # Builds CLI package first, then deploys agent
```

### Both Simultaneously

**Terminal 1:**

```bash
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0
npm run dev
```

**Terminal 2:**

```bash
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0/L0-saas-index
npm run dev
```

### Full Side-by-Side Deployment

```bash
# 1) CLI (publish from root)
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0
npm run build
npm publish --access public

# 2) Dashboard (deploy from L0-saas-index)
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0/L0-saas-index
# deploy with your host command (Vercel/Netlify)

# 3) 21st Agent (deploy from l0-21st-agents)
cd /Users/seyederick/DevOps/_project_folders/lan-onasis-monorepo/apps/vortexai-l0/l0-21st-agents
npm run deploy
```

## Git Workflow

```bash
# CLI changes
git add src/ dist/ package.json
git commit -m "feat(cli): description"

# Dashboard changes
git add L0-saas-index/
git commit -m "feat(dashboard): description"

# Push both
git push origin main
```

## Publishing

**CLI to npm:**

```bash
npm run build
npm version patch|minor|major
npm publish
```

**Dashboard:** Deploy separately to Vercel, Netlify, etc.

**21st Agent:** Deploy from `l0-21st-agents` via `@21st-sdk/cli`.

---

**Rule:** Three independent projects coexisting in one git repository, with separate builds and deployments.
