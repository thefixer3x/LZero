# Changelog

All notable changes to VortexAI L0 will be documented in this file.

## [2.0.0] - 2026-01-26

### Breaking Changes

- **Memory-first positioning**: Repositioned from "social media orchestrator" to "memory concierge"
  - All CLI commands now focus on memory capture, search, and behavioral recall
  - `vortex campaign`, `vortex l0 ask`, `vortex l0 trends` replaced with `vortex capture`, `vortex l0 memory`, `vortex l0 recall`
  - Mock database replaced with memory/decision/pattern entries

- **Plugin system overhaul**:
  - `dev-tools` → `dev-workflows` (removed `agents: [...]` delegation arrays)
  - `analytics` → `memory-insights`
  - `collaboration` → `team-context`
  - Removed `agents` field from all plugin responses (no longer an agent delegator)

- **Type changes**:
  - `L0Orchestrator` → `MemoryConcierge`
  - `L0Response` → `MemoryResponse`
  - `L0ResponseType` → `MemoryResponseType` (`'snippet' | 'memory' | 'context' | 'help' | 'recall' | 'suggestion'`)
  - Removed `'orchestration' | 'campaign'` from response types
  - Removed `'workflow'` from `OutputFormat`

- **Package name unchanged** at `vortexai-l0` (per user decision), but keywords updated:
  - Removed: `social-media`, `content-creation`
  - Added: `memory`

### Added

- `vortex capture <text>` — Capture new memory entries from CLI
- `vortex recall <query>` — Behavioral pattern recall from CLI
- `src/concierge.ts` — New `MemoryConcierge` class replacing `L0Orchestrator`
- `artifacts/legacy/` — Archived pre-2.0 files preserved for reference
- `MESSAGING_MIGRATION.md` — Documents the brand positioning transition

### Changed

- CLI `init` now highlights memory capture, pattern recall, and development workflows
- CLI `status` lists memory-focused capabilities
- All social media, viral, TikTok, hashtag, campaign references removed from source
- Plugin handlers return `MemoryResponse` instead of `L0Response`
- Plugin responses use `type: 'suggestion'` instead of `type: 'orchestration'`
- `concierge-contract.ts`: removed `orchestrate` from tool classification
- Examples rewritten for memory concierge patterns
- Version bumped to `2.0.0`

### Removed

- Social media campaign orchestration workflow
- Trend analysis commands and mock data
- Agent delegation arrays (`agents: [...]`) from all plugin responses
- `orchestrate` alias from `classifyTool()` in concierge-contract
- `social-media` and `content-creation` from package keywords

### Notes

- All pre-2.0 files preserved in `artifacts/legacy/`
- `L0-saas-index` and `l0-21st-agents` subdirectories retain their own package references
- Concierge executor (`concierge-executor.ts`) remains unchanged — already memory-focused

## [Unreleased]

### Planned

- Dual format build (ESM + CJS)
- Plugin marketplace and remote loading
- Integration tests for CLI commands
- Performance optimizations
