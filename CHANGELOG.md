# Changelog

All notable changes to VortexAI L0 will be documented in this file.

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
- Enhanced test coverage
- Integration tests for CLI commands
- Performance optimizations

