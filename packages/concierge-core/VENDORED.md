# VENDORED — @lanonasis/concierge-core

This directory is a **vendored copy** of `@lanonasis/concierge-core` (v0.1.0),
snapshot from the private monorepo
`thefixer3x/lan-onasis-monorepo` → `packages/concierge-core`
at the state that shipped in LZero commit `a0bf48b` (2026-08-19 dist rebuild).

## Why it is vendored

- LZero (this repo) declares `"@lanonasis/concierge-core": "workspace:*"` in
  `package.json`, but this standalone public repo previously had no
  `workspaces` field, and the package is **not published to npm** (registry
  404). CI therefore failed at `bun install` and never reached build/tsc/test.
- The package is `"private": true` and lives only inside the private monorepo,
  which public CI cannot fetch without leaking credentials. Publishing it to
  npm is a concierge-owner decision and out of scope for a CI-only fix.
- Vendoring it as a real workspace member (`workspaces: ["packages/concierge-core"]`)
  makes this repo fully self-contained: fresh `bun install` resolves
  `workspace:*` to `packages/concierge-core`, and the committed `dist/` means
  build/tsc/test need no pre-build step.

## What is committed

- `src/` — the package source (canonical, matches the monorepo)
- `dist/` — the compiled output, **deliberately committed** (`.gitignore`
  exception at the repo root). The package's `main`/`types` point here and the
  workspace member must be consumable from a fresh checkout.

## How to refresh this vendored copy

Run from the monorepo root (`/opt/lanonasis/lan-onasis-monorepo`):

```bash
cd packages/concierge-core
npm install && npm run build        # rebuild dist from src
cd ../../apps/vortexai-l0           # LZero checkout (this repo)
rm -rf packages/concierge-core
mkdir -p packages/concierge-core
cp -r <monorepo>/packages/concierge-core/{package.json,tsconfig.json,vitest.config.ts,README.md,src,dist} packages/concierge-core/
git add packages/concierge-core
```

Then re-verify: fresh clone → `bun install` → `bun run build` →
`bunx tsc --noEmit` → `bun run test`.

## Impact on the live concierge chain

None. The live PM2 services (`slack-memory-concierge`, `discord-memory-concierge`)
resolve `@lanonasis/concierge-core` from the **monorepo** workspace, which is
untouched. The monorepo ignores nested `workspaces` fields in workspace members
(only root globs apply), so this repo's nested `workspaces` field does not alter
monorepo install resolution, and no duplicate-package conflict is introduced.
