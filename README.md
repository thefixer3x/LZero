# VortexAI L0 (Lzero Platform CLI)

VortexAI L0 is the CLI entry point for the Lzero platform — a memory-first orchestration stack with persistent memory, semantic search, and behavioral pattern recall. This package ships the CLI and the core orchestration runtime used by the SDKs.

## Lzero platform package map

- **CLI + Orchestrator (this package)**: `vortexai-l0`
  - Node-first CLI with multiple aliases and memory-enhanced orchestration runtime.
- **Web & multi-platform SDK**: `@lanonasis/ai-sdk`
  - Browser/Node SDK for apps and UI integrations.
- **Persistent memory**: `@lanonasis/memory-sdk-standalone`
  - Memory client used by the SDK and orchestration workflows.

## CLI Installation

```bash
# Install VortexAI L0 globally
npm install -g vortexai-l0

# Or use as a project dependency
npm install vortexai-l0
```

## CLI Usage (Node)

The CLI is available under multiple command names for convenience:

- `vortex` - Full name
- `vortexai` - Alternative full name
- `l0` - Short alias
- `vxai` - Short alias (new)
- `lzero` - Short alias (new)

```bash
# Initialize workspace (any command works)
vortex init
lzero init
vxai init

# Memory-first orchestration examples
vortex l0 "remember that auth uses PKCE"
vortex l0 memory "oauth implementation patterns"
vortex l0 "recall deployment decisions"

# Development workflows
vortex l0 code "floating notification component"
vortex l0 help "oauth patterns"
```

## Programmatic API

```ts
import { MemoryConcierge } from 'vortexai-l0/memory-concierge';

const concierge = new MemoryConcierge();

// Search memories
const result = await concierge.search('oauth patterns');
console.log(result.message);

// Recall patterns
const recall = await concierge.recall('deployment');
console.log(recall.workflow);
```

### MaaS Integration

For production memory storage, configure the memory plugin:

```ts
import { configureMemoryPlugin } from 'vortexai-l0/memory-plugin';

configureMemoryPlugin({
  apiUrl: 'https://api.lanonasis.com',
  authToken: process.env.MAAS_API_KEY,
});
```

## Repository layout

- CLI package: `apps/vortexai-l0`
- SaaS landing site: `apps/vortexai-l0/L0-saas-index`
- 21st Agents workspace: `apps/vortexai-l0/l0-21st-agents`
- SDK package: `packages/ai-sdk`
- Archived legacy: `artifacts/legacy/` (pre-2.0 files)

## Build & publish (CLI)

```bash
cd apps/vortexai-l0
npm install
npm run build
npm publish --access public
```

Note: the landing site lives in `apps/vortexai-l0/L0-saas-index` and is not published to npm. Always publish from `apps/vortexai-l0` to avoid conflicts.

## 21st Agent deploy (side-by-side)

```bash
cd apps/vortexai-l0/l0-21st-agents
npm install
npm run login
npm run deploy
```

This deployment lane is separate from npm publishing (CLI) and web hosting (landing site).

## Links

- Marketing site: https://l0.vortexcore.app
- Docs: https://docs.lanonasis.com
- SDK: https://www.npmjs.com/package/@lanonasis/ai-sdk
- CLI: https://www.npmjs.com/package/vortexai-l0

---

Lzero = persistent memory + edge reasoning + orchestration. Lead with the CLI for automation workflows, and use the SDK for web and multi-platform products.
