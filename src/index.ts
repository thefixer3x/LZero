#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { l0Commands } from './commands/l0.js';

// ============================================================================
// Public API Exports
// ============================================================================

export { L0Orchestrator, orchestrator, type L0Response, type L0QueryOptions } from './orchestrator.js';

// ============================================================================
// Configuration
// ============================================================================

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
// Constants
// ============================================================================

const CLI_NAME = 'vortex';
const CLI_ALIASES = ['vortexai', 'l0'];
const CLI_DESCRIPTION = '🌪️  VortexAI L0 - Universal Work Orchestrator';
const VORTEX_EMOJI = '🌪️';
const DEFAULT_CAMPAIGN_DURATION = '7';
const DEFAULT_PLATFORMS = 'all';
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

// Add L0 Commands (Real-World Orchestration)
l0Commands(program);

// ============================================================================
// Command Definitions
// ============================================================================

program
  .command('init')
  .description('Initialize VortexAI L0 workspace')
  .action(() => {
    console.log(`${VORTEX_EMOJI}  VortexAI L0 v${packageJson.version}`);
    console.log('');
    console.log('🎯 Initialize your Universal Work Orchestrator:');
    console.log('');
    console.log('1. Social Media Campaign Orchestration:');
    console.log('   vortex l0 "create viral TikTok campaign for product launch"');
    console.log('   vortex l0 "analyze trending hashtags and schedule posts"');
    console.log('');
    console.log('2. Content Creation Workflows:');
    console.log('   vortex l0 "research competitors and create strategy doc"');
    console.log('   vortex l0 "generate weekly social media calendar"');
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
  .action(() => {
    console.log(`${VORTEX_EMOJI}  VortexAI L0 Status`);
    console.log('========================');
    console.log('Version:', packageJson.version);
    console.log('Status: 🟢 Ready for orchestration');
    console.log('');
    console.log('Active Capabilities:');
    console.log('• Social Media Campaign Management');
    console.log('• Content Creation & Strategy');
    console.log('• Multi-Agent Task Delegation');
    console.log('• Real-time Workflow Orchestration');
    console.log('• Code Snippet & Memory Retrieval');
  });

program
  .command('campaign')
  .description('Social media campaign orchestration')
  .argument('<objective>', 'Campaign objective')
  .option('-p, --platform <platforms>', 'Target platforms (comma-separated)', DEFAULT_PLATFORMS)
  .option('-d, --duration <days>', 'Campaign duration in days', DEFAULT_CAMPAIGN_DURATION)
  .option('--budget <amount>', 'Campaign budget')
  .action((objective: string, options: { platform: string; duration: string; budget?: string }) => {
    console.log('🎯 Campaign Orchestration');
    console.log('=========================');
    console.log('Objective:', objective);
    console.log('Platforms:', options.platform);
    console.log('Duration:', `${options.duration} days`);
    if (options.budget) {
      console.log('Budget:', options.budget);
    }
    console.log('');
    console.log('🤖 Delegating to specialized agents:');
    console.log('  • Research Agent: Analyzing market trends...');
    console.log('  • Content Agent: Creating post variations...');
    console.log('  • Strategy Agent: Optimizing posting schedule...');
    console.log('  • Analytics Agent: Setting up tracking...');
    console.log('');
    console.log('💡 Use "vortex l0 orchestrate" for dynamic delegation');
  });

program
  .command('automate')
  .description('Natural language orchestration interface')
  .argument('<request>', 'Natural language request')
  .option('--agents <list>', 'Specify agents to use')
  .option('--format <type>', 'Output format (interactive, json, report)', 'interactive')
  .action((request: string, options: { agents?: string; format: string }) => {
    console.log('🧠 L0 Orchestrating:', chalk.cyan(request));
    console.log('');

    // Simulate orchestration logic
    const lowerRequest = request.toLowerCase();
    const isSocialRequest = lowerRequest.includes('social') || lowerRequest.includes('campaign');
    const isContentRequest = lowerRequest.includes('content') || lowerRequest.includes('create');

    if (isSocialRequest) {
      console.log('🎯 Social Media Campaign detected');
      console.log('📋 Workflow Plan:');
      console.log('  1. Market research & competitor analysis');
      console.log('  2. Content strategy & hashtag research');
      console.log('  3. Visual content creation');
      console.log('  4. Post scheduling & automation');
      console.log('  5. Performance tracking & optimization');
    } else if (isContentRequest) {
      console.log('📝 Content Creation detected');
      console.log('📋 Workflow Plan:');
      console.log('  1. Topic research & trend analysis');
      console.log('  2. Content outline & structure');
      console.log('  3. Draft creation with SEO optimization');
      console.log('  4. Review & revision cycles');
      console.log('  5. Publication & distribution');
    } else {
      console.log('🤖 General Orchestration');
      console.log('📋 Analyzing request and delegating to appropriate agents...');
    }

    console.log('');
    console.log('💫 L0 orchestrates. You achieve.');
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
    console.log('🎯 Social Media & Content:');
    console.log('• vortex l0 "create viral campaign for eco-friendly product"');
    console.log('• vortex campaign "increase brand awareness for millennials"');
    console.log('• vortex automate "research trending topics and create 10 posts"');
    console.log('');
    console.log('🧠 Development & Memory:');
    console.log('• vortex l0 code "floating notification component"');
    console.log('• vortex l0 memory "oauth implementation notes"');
    console.log('• vortex l0 help "react patterns"');
    console.log('');
    console.log('⚡ Real-World Orchestration:');
    console.log('• vortex automate "analyze competitors and update strategy"');
    console.log('• vortex automate "create weekly performance report"');
    console.log('• vortex automate "optimize content calendar for Q4"');
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
  console.log(chalk.cyan('Universal Work Orchestrator - Beyond AI chat. True orchestration.'));
  console.log(chalk.gray(SEPARATOR));
  console.log('\n🎯 Real-World Orchestration Examples:');
  console.log(chalk.yellow('  vortex automate "create viral TikTok campaign for our new product"'));
  console.log(chalk.yellow('  vortex automate "analyze trending topics and create 20 posts"'));
  console.log(chalk.yellow('  vortex automate "research competitors and update our strategy"'));
  console.log(chalk.yellow('  vortex campaign "increase brand awareness among millennials"'));
  console.log('\n🧠 Development Memory:');
  console.log(chalk.white('  vortex l0 code "floating notification component"'));
  console.log(chalk.white('  vortex l0 memory "oauth implementation patterns"'));
  console.log(chalk.white('  vortex l0 help "react best practices"'));
  console.log('\n⚙️  Quick Start:');
  console.log(chalk.white('  vortex init'));
  console.log(chalk.white('  vortex status'));
  console.log('\n🚀 ' + chalk.bold('L0 orchestrates everything. Social media, content, code, strategy.'));
  console.log(chalk.gray('Your productivity multiplied. Not just assisted.\n'));
}

// ============================================================================
// Parse CLI Arguments
// ============================================================================

program.parse();