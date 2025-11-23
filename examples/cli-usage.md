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

## Orchestration Commands

### General Orchestration
```bash
vortex l0 ask "create viral TikTok campaign for eco-friendly product"
vortex l0 ask "analyze trending hashtags and create content calendar"
vortex l0 ask "research competitors and update our Q4 strategy"
```

### Campaign Management
```bash
vortex l0 campaign "increase brand awareness among millennials" --platforms "tiktok,instagram" --budget "$5000"
vortex l0 campaign "product launch campaign" --duration 14
```

### Code Snippets
```bash
vortex l0 code "floating notification component"
vortex l0 code "social media scheduler" --language javascript
```

### Memory Search
```bash
vortex l0 memory "oauth implementation patterns"
vortex l0 memory "campaign strategies" --limit 10
```

### Trend Analysis
```bash
vortex l0 trends tiktok --timeframe 24h
vortex l0 trends instagram --timeframe 7d --location "US"
```

### Get Help
```bash
vortex l0 help "social media"
vortex l0 help "oauth"
vortex l0 help "react patterns"
```

## Output Formats

### JSON Output
```bash
vortex l0 ask "create campaign" --format json
```

### Interactive Output (default)
```bash
vortex l0 ask "create campaign" --format text
```

## Integration Examples

### In a Script
```bash
#!/bin/bash
RESULT=$(vortex l0 ask "analyze trends" --format json)
echo $RESULT | jq '.data.trendingHashtags'
```

### In Node.js
```javascript
import { exec } from 'child_process';

exec('vortex l0 ask "create campaign" --format json', (error, stdout) => {
  const response = JSON.parse(stdout);
  console.log(response.workflow);
});
```

