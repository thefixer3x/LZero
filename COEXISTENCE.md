# VortexAI L0: CLI + Dashboard Coexistence

## Structure

```
vortexai-l0/ (root - CLI package)
├── src/                  # CLI source code
├── dist/                 # Compiled CLI (browser + node)
├── package.json          # CLI configuration
├── L0-saas-index/        # Dashboard (Next.js) - standalone subdirectory
│   ├── src/
│   ├── app/
│   ├── package.json
│   └── ...
├── examples/
└── docs/
```

## Key Points

- **L0-saas-index is NOT a git submodule** - just a regular directory
- **No embedded .git** - both tracked in main vortexai-l0 repo
- **Independent builds** - each has its own package.json and build process
- **Separate deployments** - CLI to npm, Dashboard to Vercel/Netlify

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

---

**Rule:** Two independent projects coexisting in one git repository, with separate builds and deployments.
