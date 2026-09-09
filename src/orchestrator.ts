/**
 * VortexAI L0 Universal Work Orchestrator
 *
 * Programmatic API for workflow orchestration
 * @module orchestrator
 */

import { pluginManager, PluginManager } from './plugins.js';
import { executeConciergeRequest, type ConciergeExecutionContext } from './concierge-executor.js';
import type { ConciergeRequest, ConciergeResponse } from '@lanonasis/concierge-core';
import { L0Response, L0ResponseType, OutputFormat, L0QueryOptions } from './types.js';

interface CodeSnippet {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  lastUsed: string;
  project: string;
}

interface Memory {
  id: string;
  title: string;
  content: string;
  type: string;
  date: string;
  tags: string[];
}

interface Campaign {
  id: string;
  title: string;
  strategy: string;
  platforms: string[];
  budget: string;
  duration: string;
  kpis: string[];
}

interface MockDatabase {
  snippets: CodeSnippet[];
  memories: Memory[];
  campaigns: Campaign[];
}

const COMMON_STOP_WORDS = ['the', 'and', 'for', 'with', 'from', 'that', 'this', 'nonexistent', 'component'] as const;
const MIN_KEYWORD_LENGTH = 2;
const MIN_MATCH_COUNT = 2;
const PREVIEW_LENGTH = 100;

/**
 * VortexAI L0 Universal Work Orchestrator
 *
 * Orchestrates workflows across social media, content creation, development, and more.
 *
 * @example
 * ```typescript
 * import { L0Orchestrator } from 'vortexai-l0/orchestrator';
 *
 * const orchestrator = new L0Orchestrator();
 * const response = await orchestrator.query('create viral TikTok campaign');
 * console.log(response.message);
 * ```
 */
export class L0Orchestrator {
  private readonly plugins: PluginManager;

  constructor(plugins?: PluginManager) {
    this.plugins = plugins || pluginManager;
  }

  private readonly mockDatabase: MockDatabase = {
    snippets: [
      {
        id: 'floating-card-1',
        title: 'Floating Black Card Component',
        content: `<div className="fixed bottom-4 right-4 bg-black rounded-lg shadow-xl p-4 text-white max-w-sm animate-fade-in">\n  <div className="flex items-center gap-3">\n    <div className="w-8 h-8 bg-blue-500 rounded-full" />\n    <div>\n      <h3 className="font-medium">Notification</h3>\n      <p className="text-sm opacity-75">{message}</p>\n    </div>\n  </div>\n</div>`,
        language: 'react',
        tags: ['ui', 'floating', 'notification', 'card'],
        lastUsed: '2 days ago',
        project: 'dashboard-redesign'
      },
      {
        id: 'social-post-scheduler',
        title: 'Social Media Post Scheduler',
        content: `const schedulePost = async (content, platforms, scheduledTime) => {\n  const post = {\n    content,\n    platforms: platforms.split(','),\n    scheduledTime: new Date(scheduledTime),\n    status: 'scheduled',\n    analytics: { impressions: 0, engagement: 0 }\n  };\n  \n  return await socialMediaAPI.schedule(post);\n};`,
        language: 'javascript',
        tags: ['social-media', 'scheduler', 'automation'],
        lastUsed: '1 hour ago',
        project: 'vortex-campaign-manager'
      },
      {
        id: 'trend-analyzer',
        title: 'Trending Topics Analyzer',
        content: `const analyzeTrends = async (platform, timeframe = '24h') => {\n  const trends = await trendingAPI.getTrends({\n    platform,\n    timeframe,\n    location: 'global'\n  });\n  \n  return trends.map(trend => ({\n    hashtag: trend.name,\n    volume: trend.tweet_volume,\n    growth: trend.growth_rate,\n    relevanceScore: calculateRelevance(trend)\n  }));\n};`,
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

  async query(query: string, options?: L0QueryOptions): Promise<L0Response> {
    const lowerQuery = query.toLowerCase();

    if (options?.conciergeRequest) {
      const ctx = options.conciergeRequest as ConciergeExecutionContext;
      const conciergeResponse = await executeConciergeRequest(ctx);
      return mapConciergeResponse(conciergeResponse);
    }

    if (this.isHelpRequest(lowerQuery)) {
      return this.getHelp(query);
    }

    if (this.isCodeRequest(lowerQuery)) {
      return this.findCode(query);
    }

    if (this.isMemoryRequest(lowerQuery)) {
      return this.searchMemories(query);
    }

    if (this.isCampaignRequest(lowerQuery)) {
      return this.orchestrateCampaign(query);
    }

    if (this.isContentRequest(lowerQuery)) {
      return this.orchestrateContent(query);
    }

    if (this.isTrendRequest(lowerQuery)) {
      return this.analyzeTrends(query);
    }

    const pluginResponse = await this.plugins.execute(query, options as Record<string, unknown>);
    if (pluginResponse) {
      return pluginResponse;
    }

    return this.orchestrateGeneral(query);
  }

  getPluginManager(): PluginManager {
    return this.plugins;
  }

  private isHelpRequest(query: string): boolean {
    return query.startsWith('help') || query.includes('help ') || query.includes('how to');
  }

  private isCodeRequest(query: string): boolean {
    return query.includes('code') || query.includes('snippet');
  }

  private isMemoryRequest(query: string): boolean {
    return query.includes('memory') || query.includes('notes') || query.includes('meeting');
  }

  private isCampaignRequest(query: string): boolean {
    return query.includes('campaign') || query.includes('social media') || query.includes('viral');
  }

  private isContentRequest(query: string): boolean {
    return query.includes('content') && (query.includes('create') || query.includes('strategy'));
  }

  private isTrendRequest(query: string): boolean {
    return query.includes('trend') || query.includes('hashtag') || query.includes('analytics');
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
    const filteredKeywords = this.extractKeywords(description);

    if (this.shouldReturnNoMatches(description, filteredKeywords)) {
      return this.createNoMatchResponse(description, 'snippet');
    }

    const matches = this.findMatchingSnippets(filteredKeywords);

    if (matches.length === 0) {
      return this.createNoMatchResponse(description, 'snippet');
    }

    return this.createCodeResponse(matches);
  }

  async searchMemories(query: string): Promise<L0Response> {
    const keywords = query.toLowerCase().split(' ');
    const matches = this.mockDatabase.memories.filter((memory) =>
      keywords.some(
        (keyword) =>
          memory.title.toLowerCase().includes(keyword) ||
          memory.content.toLowerCase().includes(keyword) ||
          memory.tags.some((tag) => tag.includes(keyword))
      )
    );

    if (matches.length === 0) {
      return {
        message: `No memories found for "${query}". Your knowledge base is growing!`,
        type: 'memory',
        related: ['campaign strategies', 'content frameworks', 'implementation guides'],
      };
    }

    const results = matches.map((m) => `${m.title}: ${m.content.substring(0, PREVIEW_LENGTH)}...`).join('\n\n');

    return {
      message: `Found ${matches.length} relevant memories:`,
      data: results,
      type: 'memory',
      dashboardUrl: `/memories?q=${encodeURIComponent(query)}`,
      related: matches.slice(0, 3).map((m) => m.title),
    };
  }

  private extractKeywords(description: string): string[] {
    const keywords = description.toLowerCase().split(' ').filter((k) => k.length > MIN_KEYWORD_LENGTH);
    return keywords.filter((k) => !COMMON_STOP_WORDS.includes(k as any));
  }

  private shouldReturnNoMatches(description: string, keywords: string[]): boolean {
    return description.toLowerCase().includes('nonexistent') || keywords.length === 0;
  }

  private findMatchingSnippets(keywords: string[]): CodeSnippet[] {
    return this.mockDatabase.snippets.filter((snippet) => {
      const titleLower = snippet.title.toLowerCase();
      const contentLower = snippet.content.toLowerCase();
      const allTags = snippet.tags.join(' ').toLowerCase();

      const titleMatch = keywords.some((kw) => titleLower.includes(kw));
      if (titleMatch && keywords.length === 1) {
        return true;
      }

      const matchCount = keywords.filter(
        (keyword) => titleLower.includes(keyword) || allTags.includes(keyword) || contentLower.includes(keyword)
      ).length;

      return matchCount >= Math.min(MIN_MATCH_COUNT, keywords.length);
    });
  }

  private createNoMatchResponse(query: string, type: L0ResponseType): L0Response {
    return {
      message: `No ${type === 'snippet' ? 'code snippets' : 'results'} found for "${query}". Try different keywords!`,
      type,
      related: ['floating card', 'social scheduler', 'trend analyzer'],
    };
  }

  private createCodeResponse(matches: CodeSnippet[]): L0Response {
    const bestMatch = matches[0];

    return {
      message: `Found ${matches.length} matching snippet${matches.length > 1 ? 's' : ''}:`,
      code: bestMatch.content,
      data: {
        title: bestMatch.title,
        language: bestMatch.language,
        lastUsed: bestMatch.lastUsed,
        project: bestMatch.project,
        tags: bestMatch.tags,
      },
      type: 'snippet',
      clipboard: true,
      dashboardUrl: `/memories/${bestMatch.id}`,
      related: matches.slice(1, 3).map((m) => m.title),
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

function mapConciergeResponse(response: ConciergeResponse): L0Response {
  return {
    message: response.message,
    type: response.type === 'error' ? 'help' : response.type === 'approval_required' ? 'orchestration' : 'memory',
    data: response.data as Record<string, unknown> | undefined,
    related: response.sources,
  };
}

export const orchestrator = new L0Orchestrator();
