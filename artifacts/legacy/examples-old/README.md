# VortexAI L0 Examples

This directory contains examples demonstrating how to use VortexAI L0.

## Examples

### Programmatic API
- **`programmatic-api.ts`** - Example of using the L0Orchestrator class in your own applications

### CLI Usage
- **`cli-usage.md`** - Comprehensive guide to using the CLI commands

## Running Examples

### Programmatic API Example

```bash
# Install dependencies first
bun install

# Run the programmatic API example
bun run examples/programmatic-api.ts
```

### CLI Examples

See `cli-usage.md` for detailed CLI usage examples.

## Integration Patterns

### Node.js Application
```typescript
import { L0Orchestrator } from 'vortexai-l0/orchestrator';

const orchestrator = new L0Orchestrator();
const response = await orchestrator.query('create campaign');
```

### TypeScript Project
```typescript
import { orchestrator } from 'vortexai-l0/orchestrator';

const response = await orchestrator.query('analyze trends');
```

### CLI Integration
```bash
# Use in shell scripts
vortex l0 ask "your request" --format json | jq '.workflow'
```

