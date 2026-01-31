# VortexAI L0 (Lzero Platform CLI)

VortexAI L0 is the CLI entry point for the Lzero platform — a local-first reasoning and orchestration stack with persistent memory, millisecond latency, and offline-ready execution. This package ships the CLI and the core orchestration runtime used by the SDKs.

## Lzero platform package map

- **CLI + Orchestrator (this package)**: `vortexai-l0`
  - Node-first CLI with multiple aliases and local orchestration runtime.
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

# Real-world orchestration examples
vortex l0 "develop a new feature for my application"
vortex l0 "research options for security tools"
vortex l0 "research options for marketing"
vortex l0 "research options for sales"
vortex l0 "research options for customer support"
vortex orchestrate "analyze trending hashtags and create content calendar"
vortex orchestrate "research competitors and update Q4 strategy"

# Campaign management
vortex campaign "increase brand awareness among millennials"

# Development workflows
vortex l0 code "social media scheduler component"
vortex l0 memory "oauth implementation patterns"
vortex l0 help "technical topic"
```

## Programmatic API

```ts
import { L0Orchestrator } from 'vortexai-l0/orchestrator';

const orchestrator = new L0Orchestrator();

const response = await orchestrator.query('create viral TikTok campaign');
console.log(response.workflow);
console.log(response.agents);

const code = await orchestrator.findCode('floating notification card');
console.log(code.code);
```

## Repository layout

- CLI package: `apps/vortexai-l0`
- SaaS landing site: `apps/vortexai-l0/L0-saas-index`
- SDK package: `packages/ai-sdk`

## Build & publish (CLI)

```bash
cd apps/vortexai-l0
npm install
npm run build
npm publish --access public
```

Note: the landing site lives in `apps/vortexai-l0/L0-saas-index` and is not published to npm. Always publish from `apps/vortexai-l0` to avoid conflicts.

## Links

- Marketing site: https://l0.vortexcore.app
- Docs: https://docs.lanonasis.com
- SDK: https://www.npmjs.com/package/@lanonasis/ai-sdk
- CLI: https://www.npmjs.com/package/vortexai-l0

---

Lzero = persistent memory + edge reasoning + orchestration. Lead with the CLI for automation workflows, and use the SDK for web and multi-platform products.
