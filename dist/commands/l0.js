#!/usr/bin/env node
import chalk from 'chalk';
import boxen from 'boxen';
import clipboardy from 'clipboardy';
import { L0Orchestrator } from '../orchestrator.js';
// Use the exported orchestrator class
const l0Orchestrator = new L0Orchestrator();
// Enhanced display functions for CLI
function displayL0Response(response) {
    console.log('\n' + chalk.magenta.bold('🌪️  L0:'), response.message);
    if (response.code) {
        const boxContent = response.code;
        const title = response.data?.title || 'Code Snippet';
        console.log(boxen(boxContent, {
            title: chalk.yellow(`📝 ${title}`),
            padding: 1,
            borderColor: 'yellow',
            borderStyle: 'round',
            width: Math.min(80, Math.max(50, boxContent.split('\n').reduce((max, line) => Math.max(max, line.length), 0) + 4))
        }));
        if (response.data) {
            console.log(chalk.gray(`Last used: ${response.data.lastUsed} | Project: ${response.data.project}`));
            console.log(chalk.cyan(`Tags: ${response.data.tags.join(', ')}`));
        }
        if (response.clipboard) {
            try {
                clipboardy.writeSync(response.code);
                console.log(chalk.green('📋 Copied to clipboard'));
            }
            catch {
                console.log(chalk.yellow('📋 Copy to clipboard failed'));
            }
        }
    }
    if (response.workflow) {
        console.log(chalk.blue.bold('\n📋 Orchestration Workflow:'));
        response.workflow.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
        });
    }
    if (response.agents) {
        console.log(chalk.green.bold('\n🤖 Agent Delegation:'));
        response.agents.forEach(agent => {
            console.log(`  • ${agent}`);
        });
    }
    if (response.data && !response.code && !response.workflow) {
        if (typeof response.data === 'object') {
            console.log(boxen(JSON.stringify(response.data, null, 2), {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round'
            }));
        }
        else {
            console.log(boxen(response.data, {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round'
            }));
        }
    }
    if (response.related && response.related.length > 0) {
        console.log(chalk.gray('\n✨ Related:'), response.related.map(r => chalk.cyan(r)).join(', '));
    }
    if (response.dashboardUrl) {
        console.log(chalk.gray(`🔗 View in dashboard: https://dashboard.vortexai.com${response.dashboardUrl}`));
    }
    console.log(''); // Empty line for spacing
}
// VortexAI L0 Commands - Universal Work Orchestrator
export const l0Commands = (program) => {
    const l0Cmd = program
        .command('l0')
        .alias('orchestrate')
        .description(chalk.magenta.bold('🌪️  VortexAI L0 - Universal Work Orchestrator'))
        .action(() => {
        console.log(chalk.magenta.bold('\n🌪️  VortexAI L0 - Universal Work Orchestrator'));
        console.log(chalk.gray('═'.repeat(55)));
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
        console.log('\n💫 L0 doesn\'t just answer. L0 orchestrates, delegates, and delivers.');
        console.log('');
    });
    l0Cmd
        .command('ask <query>')
        .description('Ask L0 to orchestrate any workflow')
        .option('-p, --project <name>', 'scope to specific project')
        .option('-f, --format <type>', 'output format (text, json, workflow)', 'text')
        .action(async (query, options) => {
        try {
            const response = await l0Orchestrator.query(query, options);
            if (options.format === 'json') {
                console.log(JSON.stringify(response, null, 2));
            }
            else {
                displayL0Response(response);
            }
        }
        catch (error) {
            console.error(chalk.red('❌ L0 Orchestration Error:'), error instanceof Error ? error.message : String(error));
        }
    });
    l0Cmd
        .command('code <description>')
        .description('Get code snippets from L0 memory')
        .option('-l, --language <lang>', 'filter by language')
        .option('--copy', 'copy to clipboard automatically', true)
        .action(async (description, options) => {
        try {
            const response = await l0Orchestrator.findCode(description);
            displayL0Response(response);
        }
        catch (error) {
            console.error(chalk.red('❌ Code search failed:'), error instanceof Error ? error.message : String(error));
        }
    });
    l0Cmd
        .command('memory <query>')
        .description('Search your organized memories')
        .option('--type <type>', 'memory type filter')
        .option('-l, --limit <limit>', 'number of results', '5')
        .action(async (query, options) => {
        try {
            const response = await l0Orchestrator.searchMemories(query);
            displayL0Response(response);
        }
        catch (error) {
            console.error(chalk.red('❌ Memory search failed:'), error instanceof Error ? error.message : String(error));
        }
    });
    l0Cmd
        .command('campaign <objective>')
        .description('Orchestrate social media campaign')
        .option('-p, --platforms <list>', 'target platforms (comma-separated)')
        .option('-b, --budget <amount>', 'campaign budget')
        .option('-d, --duration <days>', 'campaign duration')
        .action(async (objective, options) => {
        try {
            const query = `social media campaign: ${objective}`;
            const response = await l0Orchestrator.orchestrateCampaign(query);
            displayL0Response(response);
        }
        catch (error) {
            console.error(chalk.red('❌ Campaign orchestration failed:'), error instanceof Error ? error.message : String(error));
        }
    });
    l0Cmd
        .command('trends [platform]')
        .description('Analyze trending topics and hashtags')
        .option('-t, --timeframe <period>', 'analysis timeframe (24h, 7d, 30d)', '24h')
        .option('-l, --location <loc>', 'geographic location', 'global')
        .action(async (platform = 'all', options) => {
        try {
            const query = `analyze trends for ${platform} platform`;
            const response = await l0Orchestrator.analyzeTrends(query);
            displayL0Response(response);
        }
        catch (error) {
            console.error(chalk.red('❌ Trend analysis failed:'), error instanceof Error ? error.message : String(error));
        }
    });
    l0Cmd
        .command('help <topic>')
        .description('Get help and guidance from L0')
        .action(async (topic) => {
        try {
            const response = await l0Orchestrator.getHelp(topic);
            displayL0Response(response);
        }
        catch (error) {
            console.error(chalk.red('❌ Help request failed:'), error instanceof Error ? error.message : String(error));
        }
    });
};
export default l0Commands;
//# sourceMappingURL=l0.js.map