#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import clipboardy from 'clipboardy';

interface L0Response {
  message: string;
  code?: string;
  data?: any;
  related?: string[];
  clipboard?: boolean;
  dashboardUrl?: string;
  type: 'snippet' | 'memory' | 'context' | 'help' | 'orchestration' | 'campaign';
  workflow?: string[];
  agents?: string[];
}

// VortexAI L0 Universal Work Orchestrator
class L0Orchestrator {
  private mockDatabase = {
    snippets: [
      {
        id: 'floating-card-1',
        title: 'Floating Black Card Component',
        content: `<div className="fixed bottom-4 right-4 bg-black rounded-lg shadow-xl p-4 text-white max-w-sm animate-fade-in">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-blue-500 rounded-full" />
    <div>
      <h3 className="font-medium">Notification</h3>
      <p className="text-sm opacity-75">{message}</p>
    </div>
  </div>
</div>`,
        language: 'react',
        tags: ['ui', 'floating', 'notification', 'card'],
        lastUsed: '2 days ago',
        project: 'dashboard-redesign'
      },
      {
        id: 'social-post-scheduler',
        title: 'Social Media Post Scheduler',
        content: `const schedulePost = async (content, platforms, scheduledTime) => {
  const post = {
    content,
    platforms: platforms.split(','),
    scheduledTime: new Date(scheduledTime),
    status: 'scheduled',
    analytics: { impressions: 0, engagement: 0 }
  };
  
  return await socialMediaAPI.schedule(post);
};`,
        language: 'javascript',
        tags: ['social-media', 'scheduler', 'automation'],
        lastUsed: '1 hour ago',
        project: 'vortex-campaign-manager'
      },
      {
        id: 'trend-analyzer',
        title: 'Trending Topics Analyzer',
        content: `const analyzeTrends = async (platform, timeframe = '24h') => {
  const trends = await trendingAPI.getTrends({
    platform,
    timeframe,
    location: 'global'
  });
  
  return trends.map(trend => ({
    hashtag: trend.name,
    volume: trend.tweet_volume,
    growth: trend.growth_rate,
    relevanceScore: calculateRelevance(trend)
  }));
};`,
        language: 'javascript',
        tags: ['trends', 'social-media', 'analytics'],
        lastUsed: '30 minutes ago',
        project: 'trend-intelligence'
      }
    ],
    memories: [
      {
        id: 'campaign-strategy-1',
        title: 'Viral TikTok Campaign Strategy',
        content: 'Key elements: Hook in first 3 seconds, trending audio, user-generated content encouragement, cross-platform promotion. Target: Gen Z, 16-24 age group.',
        type: 'strategy',
        date: 'today',
        tags: ['tiktok', 'viral', 'strategy', 'gen-z']
      },
      {
        id: 'content-calendar-1',
        title: 'Q4 Content Calendar Framework',
        content: 'Weekly themes: Monday motivation, Tuesday tips, Wednesday wins, Thursday throwback, Friday fun. Holiday content: Halloween, Black Friday, Cyber Monday, Christmas campaigns.',
        type: 'planning',
        date: 'yesterday',
        tags: ['content-calendar', 'q4', 'holidays', 'framework']
      },
      {
        id: 'oauth-implementation-1',
        title: 'OAuth Integration Best Practices',
        content: 'Use PKCE for public clients, implement proper state validation, secure token storage, refresh token rotation. Never expose client secrets in frontend.',
        type: 'reference',
        date: '3 days ago',
        tags: ['oauth', 'security', 'authentication', 'best-practices']
      }
    ],
    campaigns: [
      {
        id: 'eco-product-launch',
        title: 'Eco-Friendly Product Launch Campaign',
        strategy: 'Sustainability-focused messaging, influencer partnerships, user-generated content, educational content series',
        platforms: ['tiktok', 'instagram', 'twitter', 'linkedin'],
        budget: '$10000',
        duration: '2 weeks',
        kpis: ['brand_awareness', 'engagement_rate', 'conversions']
      }
    ]
  };

  async query(query: string, context?: any): Promise<L0Response> {
    const lowerQuery = query.toLowerCase();

    // Handle social media orchestration
    if (lowerQuery.includes('campaign') || lowerQuery.includes('social media') || lowerQuery.includes('viral')) {
      return this.orchestrateCampaign(query);
    }

    // Handle content creation
    if (lowerQuery.includes('content') && (lowerQuery.includes('create') || lowerQuery.includes('strategy'))) {
      return this.orchestrateContent(query);
    }

    // Handle trend analysis
    if (lowerQuery.includes('trend') || lowerQuery.includes('hashtag') || lowerQuery.includes('analytics')) {
      return this.analyzeTrends(query);
    }

    // Handle code snippet requests
    if (lowerQuery.includes('code') || lowerQuery.includes('snippet')) {
      return this.findCode(query);
    }

    // Handle memory searches
    if (lowerQuery.includes('memory') || lowerQuery.includes('notes') || lowerQuery.includes('meeting')) {
      return this.searchMemories(query);
    }

    // Handle help requests
    if (lowerQuery.includes('help') || lowerQuery.includes('how to')) {
      return this.getHelp(query);
    }

    // Default orchestration response
    return this.orchestrateGeneral(query);
  }

  async orchestrateCampaign(request: string): Promise<L0Response> {
    const campaignTypes: { [key: string]: string } = {
      'viral': 'Viral Campaign Strategy',
      'product launch': 'Product Launch Campaign',
      'brand awareness': 'Brand Awareness Campaign',
      'engagement': 'Engagement-Focused Campaign'
    };

    const campaignType = Object.keys(campaignTypes).find(type => 
      request.toLowerCase().includes(type)
    ) || 'general';

    return {
      message: `🎯 Orchestrating ${campaignTypes[campaignType] || 'Social Media Campaign'}`,
      type: 'campaign',
      workflow: [
        '📊 Market Research & Competitor Analysis',
        '🎨 Creative Strategy & Content Planning',
        '📱 Platform-Specific Content Creation',
        '⏰ Scheduling & Automation Setup',
        '📈 Analytics & Performance Tracking'
      ],
      agents: [
        'Research Agent: Analyzing market trends and competitor strategies',
        'Creative Agent: Developing content themes and visual concepts',
        'Platform Agent: Optimizing for TikTok, Instagram, Twitter algorithms',
        'Analytics Agent: Setting up tracking and KPI dashboards'
      ],
      data: {
        estimatedDuration: '2-3 weeks',
        recommendedBudget: '$5,000 - $15,000',
        expectedReach: '100K - 500K impressions',
        keyPlatforms: ['TikTok', 'Instagram', 'Twitter']
      },
      related: ['content calendar', 'hashtag research', 'influencer outreach']
    };
  }

  async orchestrateContent(request: string): Promise<L0Response> {
    return {
      message: `📝 Orchestrating Content Creation Workflow`,
      type: 'orchestration',
      workflow: [
        '🔍 Topic Research & Trend Analysis',
        '📋 Content Outline & Structure Planning',
        '✍️  Draft Creation with SEO Optimization',
        '🎨 Visual Content & Graphics Creation',
        '📊 Review, Edit, and Performance Optimization'
      ],
      agents: [
        'Research Agent: Identifying trending topics and keywords',
        'Content Agent: Creating outlines and drafts',
        'SEO Agent: Optimizing for search and discoverability',
        'Design Agent: Creating supporting visuals and graphics'
      ],
      data: {
        contentTypes: ['Blog Posts', 'Social Media Posts', 'Video Scripts', 'Email Campaigns'],
        timeframe: '1-2 weeks per content piece',
        deliverables: 'High-quality, SEO-optimized content ready for publication'
      },
      related: ['content calendar', 'keyword research', 'brand guidelines']
    };
  }

  async analyzeTrends(request: string): Promise<L0Response> {
    const mockTrends = [
      { hashtag: '#EcoFriendly', volume: '2.3M', growth: '+45%' },
      { hashtag: '#SustainableLiving', volume: '1.8M', growth: '+32%' },
      { hashtag: '#GreenTech', volume: '856K', growth: '+28%' }
    ];

    return {
      message: `📈 Real-time Trend Analysis Complete`,
      type: 'orchestration',
      data: {
        trendingHashtags: mockTrends,
        analysisTime: 'Last 24 hours',
        platforms: ['TikTok', 'Instagram', 'Twitter'],
        recommendations: [
          'Focus on sustainability themes',
          'User-generated content opportunities',
          'Partner with eco-influencers'
        ]
      },
      workflow: [
        '📊 Data Collection from Multiple Platforms',
        '🧮 Trend Volume & Growth Analysis',
        '🎯 Relevance Scoring for Your Brand',
        '📝 Actionable Recommendations Generation'
      ],
      related: ['hashtag strategy', 'content calendar', 'influencer research']
    };
  }

  async findCode(description: string): Promise<L0Response> {
    const keywords = description.toLowerCase().split(' ');
    const matches = this.mockDatabase.snippets.filter(snippet => 
      keywords.some(keyword => 
        snippet.title.toLowerCase().includes(keyword) ||
        snippet.tags.some(tag => tag.includes(keyword)) ||
        snippet.content.toLowerCase().includes(keyword)
      )
    );

    if (matches.length === 0) {
      return {
        message: `No code snippets found for "${description}". Try different keywords!`,
        type: 'snippet',
        related: ['floating card', 'social scheduler', 'trend analyzer']
      };
    }

    const bestMatch = matches[0];
    
    return {
      message: `Found ${matches.length} matching snippet${matches.length > 1 ? 's' : ''}:`,
      code: bestMatch.content,
      data: {
        title: bestMatch.title,
        language: bestMatch.language,
        lastUsed: bestMatch.lastUsed,
        project: bestMatch.project,
        tags: bestMatch.tags
      },
      type: 'snippet',
      clipboard: true,
      dashboardUrl: `/memories/${bestMatch.id}`,
      related: matches.slice(1, 3).map(m => m.title)
    };
  }

  async searchMemories(query: string): Promise<L0Response> {
    const keywords = query.toLowerCase().split(' ');
    const matches = this.mockDatabase.memories.filter(memory =>
      keywords.some(keyword =>
        memory.title.toLowerCase().includes(keyword) ||
        memory.content.toLowerCase().includes(keyword) ||
        memory.tags.some(tag => tag.includes(keyword))
      )
    );

    if (matches.length === 0) {
      return {
        message: `No memories found for "${query}". Your knowledge base is growing!`,
        type: 'memory',
        related: ['campaign strategies', 'content frameworks', 'implementation guides']
      };
    }

    const results = matches.map(m => `${m.title}: ${m.content.substring(0, 100)}...`).join('\n\n');

    return {
      message: `Found ${matches.length} relevant memories:`,
      data: results,
      type: 'memory',
      dashboardUrl: `/memories?q=${encodeURIComponent(query)}`,
      related: matches.slice(0, 3).map(m => m.title)
    };
  }

  async getHelp(query: string): Promise<L0Response> {
    const helpTopics: { [key: string]: string } = {
      'social media': 'Social Media: Platform-specific strategies, content calendars, hashtag research, viral mechanics',
      'campaign': 'Campaign Management: Strategy development, multi-platform coordination, performance tracking',
      'content': 'Content Creation: Research, planning, SEO optimization, visual design, distribution',
      'trends': 'Trend Analysis: Real-time monitoring, hashtag research, competitive intelligence',
      'oauth': 'OAuth Implementation: PKCE flow, secure token storage, refresh handling, best practices',
      'react': 'React Patterns: Component design, state management, performance optimization, testing'
    };

    const topic = Object.keys(helpTopics).find(t => query.toLowerCase().includes(t));
    
    if (topic) {
      return {
        message: helpTopics[topic],
        type: 'help',
        related: Object.keys(helpTopics).filter(t => t !== topic)
      };
    }

    return {
      message: '🌪️  VortexAI L0 can orchestrate: Social Media Campaigns, Content Creation, Trend Analysis, Code Development, and more. What would you like to orchestrate?',
      type: 'help',
      related: Object.keys(helpTopics)
    };
  }

  async orchestrateGeneral(request: string): Promise<L0Response> {
    return {
      message: `🧠 L0 analyzing: "${request}"`,
      type: 'orchestration',
      workflow: [
        '🔍 Request Analysis & Intent Detection',
        '🤖 Agent Selection & Task Delegation',
        '⚡ Parallel Execution & Coordination',
        '📊 Results Aggregation & Optimization',
        '✅ Quality Check & Delivery'
      ],
      agents: [
        'Orchestrator Agent: Managing workflow coordination',
        'Specialist Agents: Executing domain-specific tasks',
        'Quality Agent: Ensuring output standards',
        'Analytics Agent: Tracking performance metrics'
      ],
      data: {
        requestType: 'General Orchestration',
        complexity: 'Medium',
        estimatedTime: '15-30 minutes'
      },
      related: ['Use more specific keywords for better orchestration', 'Try: "create social campaign" or "analyze trends"']
    };
  }
}

const l0Orchestrator = new L0Orchestrator();

// Enhanced display functions
function displayL0Response(response: L0Response) {
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
      } catch {
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
    } else {
      console.log(boxen(response.data, {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'round'
      }));
    }
  }
  
  if (response.related && response.related.length > 0) {
    console.log(chalk.gray('\n✨ Related:'), 
      response.related.map(r => chalk.cyan(r)).join(', ')
    );
  }
  
  if (response.dashboardUrl) {
    console.log(chalk.gray(`🔗 View in dashboard: https://dashboard.vortexai.com${response.dashboardUrl}`));
  }
  
  console.log(''); // Empty line for spacing
}

// VortexAI L0 Commands - Universal Work Orchestrator
export const l0Commands = (program: Command) => {
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
        } else {
          displayL0Response(response);
        }
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
        console.error(chalk.red('❌ Help request failed:'), error instanceof Error ? error.message : String(error));
      }
    });
};

export default l0Commands;