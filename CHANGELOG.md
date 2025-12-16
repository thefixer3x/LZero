# Changelog


All notable changes to VortexAI L0 will be documented in this file.

## [1.2.0] - 2025-12-15

### Added
- **Browser-safe entrypoint**: new `src/index.ts` that only exports programmatic APIs (no Node-only deps).
- **Split CLI entry**: moved CLI implementation to `src/cli.ts` to keep browser builds clean.
- **Dual build configs**:
  - `tsconfig.browser.json` (ESM + DOM)
  - `tsconfig.node.json` (Node)
- **Conditional exports**: explicit subpath exports for `./`, `./browser`, `./cli`, `./orchestrator`, and `./plugins`.

### Changed
- `package.json` output mapping:
  - `main` → `dist/node/index.js` (Node)
  - `module` / `types` → `dist/browser/index.js` / `.d.ts` (browser)
- `bin` now points to `dist/node/cli.js` (Node-only CLI).
- `browser` field remaps Node bundles to browser bundles.
- Build scripts now include `build:browser` and `build:node`.
- README updated with browser/front-end usage guidance and clarified Node-only CLI usage.

### Notes
- Builds pass for both browser and node outputs (`bun run build`).
- Tests should be re-run post-refactor (Vitest) to confirm coverage after the split.

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
