# Changelog


All notable changes to VortexAI L0 will be documented in this file.

## [1.2.0] - 2026-01-23

### Added
- **Memory Services Plugin**: Lean integration with LanOnasis MaaS API
  - Core CRUD operations: `search`, `create`, `list`, `get`, `delete`
  - New `./memory-plugin` export path for modular imports
  - Browser-safe REST-only design (no SDK-in-SDK coupling)
  - Configurable via `configureMemoryPlugin({ apiUrl, authToken })`

- **Intelligence Features**: AI-powered memory enhancements
  - `suggestTags(memoryId)` - AI tag suggestions for memories
  - `findRelated(memoryId)` - Semantic similarity search
  - `detectDuplicates(threshold)` - Find redundant memories

- **Behavioral Features**: Workflow pattern learning
  - `recallBehavior(context)` - Recall similar past workflows
  - `suggestNextAction(state)` - AI-powered next step suggestions
  - `recordPattern(input)` - Record successful workflow patterns

- **38 Trigger Keywords**: Expanded intent detection for natural language routing
  - Core: `remember`, `recall`, `find`, `search`, `save`, `store`, `list`, `delete`, `forget`
  - Intelligence: `suggest tags`, `tag this`, `related`, `similar`, `duplicate`, `cleanup`
  - Behavioral: `pattern`, `workflow`, `what next`, `next step`, `record this`, `that worked`

- **Browser-safe entrypoint**: new `src/index.ts` that only exports programmatic APIs (no Node-only deps)
- **Split CLI entry**: moved CLI implementation to `src/cli.ts` to keep browser builds clean
- **Dual build configs**:
  - `tsconfig.browser.json` (ESM + DOM)
  - `tsconfig.node.json` (Node)
- **Conditional exports**: explicit subpath exports for `./`, `./browser`, `./cli`, `./orchestrator`, `./plugins`, `./memory-plugin`

### Changed
- `package.json` output mapping:
  - `main` → `dist/node/index.js` (Node)
  - `module` / `types` → `dist/browser/index.js` / `.d.ts` (browser)
- `bin` now points to `dist/node/cli.js` (Node-only CLI)
- `browser` field remaps Node bundles to browser bundles
- Build scripts now include `build:browser` and `build:node`
- Environment variable access now uses `globalThis` pattern for browser safety

### Notes
- All 10 intent routing tests pass
- Memory plugin bundle size: ~21KB (browser)
- Total package size: 44.3 KB compressed

## [1.1.0] - 2024-12-15

### Added
- **Plugin System**: Extensible plugin architecture for custom agents and workflows
  - `PluginManager` class for registering and managing plugins
  - 3 built-in plugins: `dev-tools`, `analytics`, `collaboration`
  - CLI commands: `vortex l0 plugins list|info|enable|disable`
  - Programmatic API: `import { PluginManager } from 'vortexai-l0/plugins'`
- **New CLI Aliases**: Added shorter command alternatives
  - `vxai` - Quick 4-character alias
  - `lzero` - Memorable alternative to `l0`
- **24 new tests** for plugin system (38 total tests)

### Changed
- `L0Orchestrator` now accepts optional `PluginManager` in constructor
- Query routing now checks plugins before falling back to general orchestration
- Updated `package.json` exports to include `/plugins` subpath

## [1.0.0] - 2024-11-22

### Added
- **Programmatic API**: Export `L0Orchestrator` class for use in other applications
- **Type Definitions**: Full TypeScript support with exported types
- **Modern Module Exports**: Added `exports` field for ESM and CommonJS compatibility
- **Testing Framework**: Vitest setup with comprehensive unit tests
- **Examples Directory**: Usage examples for both CLI and programmatic API
- **CI/CD**: GitHub Actions workflow for automated testing
- **Publishing Configuration**: Proper npm publishing setup with `files`, `types`, and `publishConfig`

### Changed
- Refactored orchestrator logic into separate module for reusability
- Updated package.json with proper npm publishing fields
- Improved TypeScript configuration for better type definitions

### Fixed
- Missing `types` field in package.json
- Missing `files` field for controlled npm publishing
- Missing `prepublishOnly` script
- Missing `publishConfig` for public npm access

## [Unreleased]

### Planned
- Dual format build (ESM + CJS)
- Plugin marketplace and remote loading
- Integration tests for CLI commands
- Performance optimizations
