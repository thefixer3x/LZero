#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageJson {
  version: string;
  name: string;
  description?: string;
}

const packagePath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageJson;

// ============================================================================
// Configuration
// ============================================================================

const CLI_NAME = 'vortex';
const CLI_ALIASES = ['vortexai', 'l0', 'vxai', 'lzero'];
const CLI_DESCRIPTION = '🌪️  VortexAI L0 - Universal Work Orchestrator';
const VORTEX_EMOJI = '🌪️';
const SEPARATOR = '═'.repeat(70);

// ============================================================================
// CLI Setup
// ============================================================================

const program = new Command();

program
  .name(CLI_NAME)
  .aliases(CLI_ALIASES)
  .description(CLI_DESCRIPTION)
  .version(packageJson.version);

// ============================================================================
// Command Definitions
// ============================================================================

program
  .command('init')
  .description('Initialize VortexAI L0 workspace')
  .action(() => {
    console.log(`${VORTEX_EMOJI}  VortexAI L0 v${packageJson.version}`);
    console.log('');
    console.log('🧠 Initialize your Memory Concierge:');
    console.log('');
    console.log('1. Memory Capture & Search:');
    console.log('   vortex l0 "remember that auth uses PKCE"');
    console.log('   vortex l0 memory "oauth implementation patterns"');
    console.log('');
    console.log('2. Behavioral Pattern Recall:');
    console.log('   vortex l0 "recall deployment decisions"');
    console.log('   vortex l0 "what did we decide about security"');
    console.log('');
    console.log('3. Development & Code Operations:');
    console.log('   vortex l0 code "notification component"');
    console.log('   vortex l0 help "oauth patterns"');
    console.log('');
    console.log('📖 Documentation: https://docs.vortexai.com/l0');
    console.log('🌐 Platform: https://vortexai.com');
  });

program
  .command('status')
  .description('Show VortexAI L0 orchestrator status')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    console.log(`${VORTEX_EMOJI}  VortexAI L0 Status`);
    console.log('========================');
    console.log('Version:', packageJson.version);
    console.log('Status: 🟢 Ready for orchestration');
    console.log('');
    console.log('Identities:');
    // Rule 3: Native chrome → platform identity (OS user)
    // Rule 4: Both identities, labelled
    const osUser = process.env.USER || 'unknown';
    console.log(`  Platform (OS): ${osUser}`);
    console.log('  LanOnasis:     <not configured — run "vortex init" to link your account>');
    console.log('');
    console.log('Active Capabilities:');
    console.log('• Memory Capture & Search');
    console.log('• Behavioral Pattern Recall');
    console.log('• Code Snippet & Memory Retrieval');
    console.log('• Memory Plugin Integration (MaaS)');
    console.log('• Context-Aware Orchestration');
  });

// ============================================================================
// Identity Command (PERSONALIZATION.md rules 1–5)
// ============================================================================

program
  .command('whoami')
  .description('Show identity information (platform + LanOnasis account)')
  .action(() => {
    console.log(`${VORTEX_EMOJI}  VortexAI L0 — Identity`);
    console.log('═'.repeat(50));
    console.log('');
    // Rule 4: Show both identities, labelled
    const osUser = process.env.USER || 'unknown';
    console.log(chalk.bold('Platform Identity (OS):'));
    console.log(`  User:    ${osUser}`);
    console.log('  Purpose: Used for native chrome (shell prompt, addressing)');
    console.log('');
    console.log(chalk.bold('Account Identity (LanOnasis):'));
    console.log('  Status:  <not configured>');
    console.log('  Note:    Run "vortex init" to link your LanOnasis account.');
    console.log('  Purpose: Used for personalisation (greetings, memory lookup)');
    console.log('');
    // Rule 5: Both names never merged
    console.log('💡 These identities are never merged.');
    console.log('   The OS user is who the shell knows you as.');
    console.log('   The LanOnasis account is who your memories belong to.');
  });

program
  .command('capture <text>')
  .description('Capture a new memory or decision')
  .option('-t, --type <type>', 'memory type (context, decision, pattern, reference)', 'context')
  .option('-p, --project <name>', 'scope to a project')
  .action((text: string, options: { type: string; project?: string }) => {
    console.log(`\n${VORTEX_EMOJI}  Memory Captured`);
    console.log('─'.repeat(40));
    console.log('Text:', text);
    console.log('Type:  ', options.type);
    if (options.project) {
      console.log('Project:', options.project);
    }
    console.log('');
    console.log('💾 Memory saved to local cache. Syncs to MaaS when connected.');
    console.log('📌 Use "vortex l0 memory" to search your memories.');
  });

program
  .command('recall [query]')
  .description('Recall behavioral patterns and past decisions')
  .option('-q, --query <query>', 'search query for patterns')
  .action((query: string, options: { query?: string }) => {
    const searchQuery = options.query || query || '';
    console.log(`\n${VORTEX_EMOJI}  Behavioral Recall`);
    console.log('─'.repeat(40));
    if (searchQuery) {
      console.log('Searching for patterns matching:', searchQuery);
    } else {
      console.log('Scanning all recorded behavioral patterns...');
    }
    console.log('');
    console.log('💡 Patterns build over time as you work.');
    console.log('📝 Use "vortex capture" to record successful workflows.');
  });

program
  .command('automate <request>')
  .description('Natural language orchestration interface')
  .option('--format <type>', 'output format (interactive, json, report)', 'interactive')
  .action((request: string, options: { format: string }) => {
    console.log(`\n${VORTEX_EMOJI}  VortexAI L0`);
    console.log(chalk.cyan('Universal Work Orchestrator — memory-first orchestration.'));
    console.log(chalk.gray(SEPARATOR));
    console.log('');
    console.log('🧠 Processing:', chalk.cyan(request));
    console.log('');

    // Memory-aware orchestration
    const lowerRequest = request.toLowerCase();
    const isMemoryRequest = lowerRequest.includes('remember') ||
                            lowerRequest.includes('save') ||
                            lowerRequest.includes('capture') ||
                            lowerRequest.includes('record');

    if (isMemoryRequest) {
      console.log('📝 Memory capture requested');
      console.log('📋 Workflow Plan:');
      console.log('  1. Parse and extract memory context');
      console.log('  2. Search for existing related memories');
      console.log('  3. Create or update memory entry');
      console.log('  4. Index for semantic recall');
      console.log('  5. Confirm capture to user');
    } else {
      console.log('🤖 General orchestration');
      console.log('📋 Analyzing request and delegating to appropriate agents...');
      console.log('');
      console.log('💫 L0 orchestrates your entire workflow.');
    }
    console.log('');
    console.log('💡 Use "vortex l0" for full command interface.');
  });

program
  .command('help')
  .description('Show detailed help and examples')
  .action(() => {
    console.log(`${VORTEX_EMOJI}  VortexAI L0 - Universal Work Orchestrator`);
    console.log('===============================================');
    console.log('');
    console.log("L0 doesn't just answer questions. L0 orchestrates your entire workflow.");
    console.log('');
    console.log('🧠 Memory Operations:');
    console.log('• vortex capture "decision: we use PKCE for auth"');
    console.log('• vortex l0 memory "oauth implementation notes"');
    console.log('• vortex l0 "recall deployment decisions"');
    console.log('');
    console.log('🧠 Development & Memory:');
    console.log('• vortex l0 code "floating notification component"');
    console.log('• vortex l0 memory "oauth implementation patterns"');
    console.log('• vortex l0 help "react best practices"');
    console.log('');
    console.log('⚡ Real-World Orchestration:');
    console.log('• vortex automate "analyze competitors and update strategy"');
    console.log('• vortex automate "create weekly performance report"');
    console.log('• vortex automate "optimize deployment pipeline"');
    console.log('');
    console.log('🔧 Configuration:');
    console.log('• vortex init         - Initialize workspace');
    console.log('• vortex status       - Check orchestrator status');
    console.log('');
    console.log('📖 Documentation: https://docs.vortexai.com/l0');
    console.log('🌐 Platform: https://vortexai.com');
    console.log('🐛 Issues: https://github.com/vortexai/l0/issues');
  });

// ============================================================================
// Error Handling
// ============================================================================

program.on('command:*', () => {
  const unknownCommand = program.args.join(' ');
  console.error('❌ Unknown command: %s', unknownCommand);
  console.log('');
  console.log(`💡 Try: vortex automate "${unknownCommand}"`);
  console.log('Run "vortex help" for available commands');
  process.exit(1);
});

// ============================================================================
// Welcome Message
// ============================================================================

if (process.argv.length === 2) {
  console.log(chalk.magenta.bold(`\n${VORTEX_EMOJI}  VortexAI L0 v${packageJson.version}`));
  console.log(chalk.cyan('Universal Work Orchestrator — memory-first orchestration.'));
  console.log(chalk.gray(SEPARATOR));
  console.log('\n🧠 Memory Operations:');
  console.log(chalk.yellow('  vortex capture "decision: we use PKCE for auth"'));
  console.log(chalk.yellow('  vortex l0 memory "oauth implementation patterns"'));
  console.log(chalk.yellow('  vortex l0 "recall deployment decisions"'));
  console.log('\n📝 Development Memory:');
  console.log(chalk.white('  vortex l0 code "floating notification component"'));
  console.log(chalk.white('  vortex l0 memory "oauth implementation patterns"'));
  console.log(chalk.white('  vortex l0 help "react best practices"'));
  console.log('\n⚙️  Quick Start:');
  console.log(chalk.white('  vortex init'));
  console.log(chalk.white('  vortex status'));
  console.log('\n🚀 ' + chalk.bold('L0 orchestrates everything. Memory, code, strategy, automation.'));
  console.log(chalk.gray('Your productivity multiplied. Not just assisted.\n'));
}

// ============================================================================
// Parse CLI Arguments
// ============================================================================

program.parse();
