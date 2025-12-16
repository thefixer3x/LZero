#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import clipboardy from 'clipboardy';
import { L0Orchestrator, L0Response } from '../orchestrator.js';
import { pluginManager } from '../plugins.js';

// ============================================================================
// Constants
// ============================================================================

const BOX_MIN_WIDTH = 50;
const BOX_MAX_WIDTH = 80;
const BOX_PADDING = 4;
const SEPARATOR_LENGTH = 55;
const VORTEX_EMOJI = '🌪️';

// ============================================================================
// Orchestrator Instance
// ============================================================================

const l0Orchestrator = new L0Orchestrator();

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display L0 response in a formatted CLI output
 *
 * @param response - The L0 response to display
 */
function displayL0Response(response: L0Response): void {
  console.log('\n' + chalk.magenta.bold(`${VORTEX_EMOJI}  L0:`), response.message);

  displayCodeSnippet(response);
  displayWorkflow(response);
  displayAgents(response);
  displayData(response);
  displayRelated(response);
  displayDashboardUrl(response);

  console.log('');
}

/**
 * Display code snippet with metadata
 */
function displayCodeSnippet(response: L0Response): void {
  if (!response.code) return;

  const boxContent = response.code;
  const data = response.data as Record<string, unknown> | undefined;
  const title = (data?.title as string) || 'Code Snippet';

  const boxWidth = calculateBoxWidth(boxContent);

  console.log(
    boxen(boxContent, {
      title: chalk.yellow(`📝 ${title}`),
      padding: 1,
      borderColor: 'yellow',
      borderStyle: 'round',
      width: boxWidth,
    })
  );

  if (data) {
    console.log(chalk.gray(`Last used: ${data.lastUsed} | Project: ${data.project}`));
    console.log(chalk.cyan(`Tags: ${(data.tags as string[]).join(', ')}`));
  }

  if (response.clipboard) {
    copyToClipboard(response.code);
  }
}

/**
 * Display workflow steps
 */
function displayWorkflow(response: L0Response): void {
  if (!response.workflow) return;

  console.log(chalk.blue.bold('\n📋 Orchestration Workflow:'));
  response.workflow.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });
}

/**
 * Display agent delegation
 */
function displayAgents(response: L0Response): void {
  if (!response.agents) return;

  console.log(chalk.green.bold('\n🤖 Agent Delegation:'));
  response.agents.forEach((agent) => {
    console.log(`  • ${agent}`);
  });
}

/**
 * Display data payload
 */
function displayData(response: L0Response): void {
  if (!response.data || response.code || response.workflow) return;

  const content = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;

  console.log(
    boxen(content, {
      padding: 1,
      borderColor: 'green',
      borderStyle: 'round',
    })
  );
}

/**
 * Display related items
 */
function displayRelated(response: L0Response): void {
  if (!response.related || response.related.length === 0) return;

  console.log(chalk.gray('\n✨ Related:'), response.related.map((r) => chalk.cyan(r)).join(', '));
}

/**
 * Display dashboard URL
 */
function displayDashboardUrl(response: L0Response): void {
  if (!response.dashboardUrl) return;

  console.log(chalk.gray(`🔗 View in dashboard: https://dashboard.vortexai.com${response.dashboardUrl}`));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate optimal box width for content
 */
function calculateBoxWidth(content: string): number {
  const maxLineLength = content.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
  return Math.min(BOX_MAX_WIDTH, Math.max(BOX_MIN_WIDTH, maxLineLength + BOX_PADDING));
}

/**
 * Copy content to clipboard with error handling
 */
function copyToClipboard(content: string): void {
  try {
    clipboardy.writeSync(content);
    console.log(chalk.green('📋 Copied to clipboard'));
  } catch {
    console.log(chalk.yellow('📋 Copy to clipboard failed'));
  }
}

// ============================================================================
// Command Options Interfaces
// ============================================================================

interface QueryOptions {
  project?: string;
  format: 'text' | 'json' | 'workflow';
  [key: string]: unknown;
}

interface CodeOptions {
  language?: string;
  copy: boolean;
}

interface MemoryOptions {
  type?: string;
  limit: string;
}

interface CampaignOptions {
  platforms?: string;
  budget?: string;
  duration?: string;
}

interface TrendsOptions {
  timeframe: string;
  location: string;
}

// ============================================================================
// Command Registration
// ============================================================================

/**
 * Register L0 commands with the CLI program
 *
 * @param program - Commander.js program instance
 */
export const l0Commands = (program: Command): void => {
  const l0Cmd = program
    .command('l0')
    .alias('orchestrate')
    .description(chalk.magenta.bold(`${VORTEX_EMOJI}  VortexAI L0 - Universal Work Orchestrator`))
    .action(() => {
      console.log(chalk.magenta.bold(`\n${VORTEX_EMOJI}  VortexAI L0 - Universal Work Orchestrator`));
      console.log(chalk.gray('═'.repeat(SEPARATOR_LENGTH)));
      console.log('\n🎯 L0 orchestrates your entire workflow:');
      console.log(chalk.cyan('  • Social media campaigns & viral content creation'));
      console.log(chalk.cyan('  • Multi-platform content strategy & automation'));
      console.log(chalk.cyan('  • Real-time trend analysis & competitor research'));
      console.log(chalk.cyan('  • Code development & memory management'));
      console.log(chalk.cyan('  • Multi-agent task coordination & delegation'));
      console.log('\n🚀 Real-world orchestration examples:');
      console.log(chalk.yellow('  vortex l0 "create viral TikTok campaign for eco-product"'));
      console.log(chalk.yellow('  vortex l0 "analyze trending hashtags and create content calendar"'));
      console.log(chalk.yellow('  vortex l0 "research competitors and update our Q4 strategy"'));
      console.log(chalk.yellow('  vortex l0 code "social media scheduler component"'));
      console.log("\n💫 L0 doesn't just answer. L0 orchestrates, delegates, and delivers.");
      console.log('');
    });

  l0Cmd
    .command('ask <query>')
    .description('Ask L0 to orchestrate any workflow')
    .option('-p, --project <name>', 'scope to specific project')
    .option('-f, --format <type>', 'output format (text, json, workflow)', 'text')
    .action(async (query: string, options: QueryOptions) => {
      try {
        const response = await l0Orchestrator.query(query, options);
        if (options.format === 'json') {
          console.log(JSON.stringify(response, null, 2));
        } else {
          displayL0Response(response);
        }
      } catch (error) {
        handleError('L0 Orchestration Error', error);
      }
    });

  l0Cmd
    .command('code <description>')
    .description('Get code snippets from L0 memory')
    .option('-l, --language <lang>', 'filter by language')
    .option('--copy', 'copy to clipboard automatically', true)
    .action(async (description: string, options: CodeOptions) => {
      try {
        const response = await l0Orchestrator.findCode(description);
        displayL0Response(response);
      } catch (error) {
        handleError('Code search failed', error);
      }
    });

  l0Cmd
    .command('memory <query>')
    .description('Search your organized memories')
    .option('--type <type>', 'memory type filter')
    .option('-l, --limit <limit>', 'number of results', '5')
    .action(async (query: string, options: MemoryOptions) => {
      try {
        const response = await l0Orchestrator.searchMemories(query);
        displayL0Response(response);
      } catch (error) {
        handleError('Memory search failed', error);
      }
    });

  l0Cmd
    .command('campaign <objective>')
    .description('Orchestrate social media campaign')
    .option('-p, --platforms <list>', 'target platforms (comma-separated)')
    .option('-b, --budget <amount>', 'campaign budget')
    .option('-d, --duration <days>', 'campaign duration')
    .action(async (objective: string, options: CampaignOptions) => {
      try {
        const query = `social media campaign: ${objective}`;
        const response = await l0Orchestrator.orchestrateCampaign(query);
        displayL0Response(response);
      } catch (error) {
        handleError('Campaign orchestration failed', error);
      }
    });

  l0Cmd
    .command('trends [platform]')
    .description('Analyze trending topics and hashtags')
    .option('-t, --timeframe <period>', 'analysis timeframe (24h, 7d, 30d)', '24h')
    .option('-l, --location <loc>', 'geographic location', 'global')
    .action(async (platform = 'all', options: TrendsOptions) => {
      try {
        const query = `analyze trends for ${platform} platform`;
        const response = await l0Orchestrator.analyzeTrends(query);
        displayL0Response(response);
      } catch (error) {
        handleError('Trend analysis failed', error);
      }
    });

  l0Cmd
    .command('help <topic>')
    .description('Get help and guidance from L0')
    .action(async (topic: string) => {
      try {
        const response = await l0Orchestrator.getHelp(topic);
        displayL0Response(response);
      } catch (error) {
        handleError('Help request failed', error);
      }
    });

  // Plugin management commands
  const pluginsCmd = l0Cmd
    .command('plugins')
    .description('Manage L0 plugins and extensions');

  pluginsCmd
    .command('list')
    .description('List all registered plugins')
    .option('--json', 'Output as JSON')
    .action((options: { json?: boolean }) => {
      const plugins = pluginManager.listDetailed();

      if (options.json) {
        console.log(JSON.stringify(plugins, null, 2));
        return;
      }

      console.log(chalk.magenta.bold(`\n${VORTEX_EMOJI}  L0 Plugins`));
      console.log(chalk.gray('═'.repeat(SEPARATOR_LENGTH)));
      console.log(`\n📦 ${chalk.bold(`${pluginManager.count} plugins registered`)} (${pluginManager.enabledCount} enabled)\n`);

      if (plugins.length === 0) {
        console.log(chalk.yellow('No plugins registered. Use custom plugins to extend L0 capabilities.'));
        return;
      }

      plugins.forEach((plugin) => {
        const status = plugin.enabled ? chalk.green('●') : chalk.gray('○');
        console.log(`${status} ${chalk.bold(plugin.name)} ${chalk.gray(`v${plugin.version}`)}`);
        console.log(`  ${chalk.dim(plugin.description)}`);
        console.log(`  ${chalk.cyan('Triggers:')} ${plugin.triggers.join(', ')}`);
        console.log('');
      });
    });

  pluginsCmd
    .command('info <name>')
    .description('Show detailed information about a plugin')
    .action((name: string) => {
      const plugin = pluginManager.get(name);

      if (!plugin) {
        console.error(chalk.red(`Plugin "${name}" not found`));
        process.exit(1);
      }

      const { metadata, triggers, priority } = plugin;

      console.log(chalk.magenta.bold(`\n${VORTEX_EMOJI}  Plugin: ${metadata.name}`));
      console.log(chalk.gray('═'.repeat(SEPARATOR_LENGTH)));
      console.log(`\n${chalk.bold('Version:')} ${metadata.version}`);
      console.log(`${chalk.bold('Description:')} ${metadata.description}`);
      if (metadata.author) {
        console.log(`${chalk.bold('Author:')} ${metadata.author}`);
      }
      if (metadata.keywords?.length) {
        console.log(`${chalk.bold('Keywords:')} ${metadata.keywords.join(', ')}`);
      }
      console.log(`${chalk.bold('Priority:')} ${priority || 0}`);
      console.log(`${chalk.bold('Triggers:')} ${triggers.join(', ')}`);
      console.log('');
    });

  pluginsCmd
    .command('enable <name>')
    .description('Enable a plugin')
    .action((name: string) => {
      if (pluginManager.setEnabled(name, true)) {
        console.log(chalk.green(`✅ Plugin "${name}" enabled`));
      } else {
        console.error(chalk.red(`Plugin "${name}" not found`));
      }
    });

  pluginsCmd
    .command('disable <name>')
    .description('Disable a plugin')
    .action((name: string) => {
      if (pluginManager.setEnabled(name, false)) {
        console.log(chalk.yellow(`⏸️  Plugin "${name}" disabled`));
      } else {
        console.error(chalk.red(`Plugin "${name}" not found`));
      }
    });
};

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle and display errors in a consistent format
 *
 * @param context - Error context message
 * @param error - The error object
 */
function handleError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`❌ ${context}:`), errorMessage);
}

export default l0Commands;
