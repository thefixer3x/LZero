# CLI Usage Examples

## Basic Commands

### Initialize Workspace
```bash
vortex init
```

### Check Status
```bash
vortex status
```

## Memory Commands

### Capture a Memory
```bash
vortex capture "decision: we use PKCE for auth"
vortex capture --type decision "token rotation every 24h"
vortex capture --type pattern "deploy flow: lint -> test -> build -> deploy"
```

### Search Memories
```bash
vortex l0 memory "authentication patterns"
vortex l0 memory "deployment decisions" --limit 10
```

### Recall Patterns
```bash
vortex l0 recall "deployment patterns"
vortex l0 recall "how did we set up auth"
```

### Code Snippets
```bash
vortex l0 code "notification component"
vortex l0 code "auth hook" --language typescript
```

### Get Help
```bash
vortex l0 help "memory"
vortex l0 help "recalling patterns"
```

## Output Formats

### JSON Output
```bash
vortex l0 ask "your request" --format json
```

### Interactive Output (default)
```bash
vortex l0 ask "your request" --format text
```

## Integration Examples

### In a Script
```bash
#!/bin/bash
RESULT=$(vortex l0 ask "analyze trends" --format json)
echo $RESULT | jq '.data'
```

### In Node.js
```javascript
import { exec } from 'child_process';

exec('vortex l0 ask "your request" --format json', (error, stdout) => {
  const response = JSON.parse(stdout);
  console.log(response.workflow);
});
```
