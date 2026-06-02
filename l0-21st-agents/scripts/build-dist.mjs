import { cpSync, existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const templateDist = join(rootDir, 'agents/vortexai-l0-orchestrator/template/dist');
const sourceDist = join(rootDir, '../dist/node');

console.log('📦 Building L0 dist for 21st sandbox...\n');

// Verify source dist exists
if (!existsSync(sourceDist)) {
  console.error('✘ Source dist not found. Run "npm run build:l0" first.');
  process.exit(1);
}

// Clean template dist
try { rmSync(templateDist, { force: true, recursive: true }); } catch {}
cpSync(sourceDist, templateDist, { force: true, recursive: true });
console.log(`  ✓ Copied dist/node → template/dist`);

// Copy package.json to template dist (for file:./dist resolution)
const pkg = JSON.parse(readFileSync(join(rootDir, '../package.json'), 'utf-8'));
writeFileSync(join(templateDist, 'package.json'), JSON.stringify(pkg, null, 2));
console.log(`  ✓ Copied package.json → template/dist`);

// Verify orchestrator is present
if (!existsSync(join(templateDist, 'orchestrator.js'))) {
  console.error('✘ orchestrator.js not found in dist. Build may have failed.');
  process.exit(1);
}

console.log(`\n✅ Dist ready at agents/vortexai-l0-orchestrator/template/dist/\n`);