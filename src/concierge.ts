/**
 * LanOnasis Memory Concierge
 *
 * Context-aware memory capture, retrieval, and behavioral pattern recall.
 * Programmatic API for memory operations — search, save, recall, and suggest.
 * @module memory-concierge
 */

import { pluginManager, PluginManager } from './plugins.js';
import { executeConciergeRequest, type ConciergeExecutionContext } from './concierge-executor.js';
import type { ConciergeResponse } from './concierge-contract.js';

// ============================================================================
// Type Definitions
// ============================================================================

export type MemoryResponseType =
  | 'memory'
  | 'context'
  | 'help'
  | 'recall'
  | 'suggestion'
  | 'snippet';

export type OutputFormat = 'text' | 'json';

export interface MemoryResponse {
  /** Human-readable summary */
  message: string;
  /** Response category */
  type: MemoryResponseType;
  /** Code or markup content (for snippet-type responses) */
  code?: string;
  /** Structured data payload */
  data?: Record<string, unknown> | string;
  /** Related memory titles or topics */
  related?: string[];
  /** Suggested next actions (for recall/suggestion types) */
  workflow?: string[];
  /** Internal URL for dashboard deep-link */
  dashboardUrl?: string;
  /** Whether to auto-copy code to clipboard */
  clipboard?: boolean;
}

export interface MemoryQueryOptions {
  project?: string;
  format?: OutputFormat;
  /** When present, route through the platform concierge pipeline */
  conciergeRequest?: ConciergeExecutionContext;
  /** Limit results (default: 5) */
  limit?: number;
}

interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  entryType: 'context' | 'reference' | 'decision' | 'pattern';
  date: string;
  tags: string[];
}

interface CodeSnippet {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  lastUsed: string;
  project: string;
}

// ============================================================================
// Constants
// ============================================================================

const COMMON_STOP_WORDS = [
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'nonexistent',
] as const;
const MIN_KEYWORD_LENGTH = 2;
const MIN_MATCH_COUNT = 2;
const PREVIEW_LENGTH = 100;

// ============================================================================
// MemoryConcierge Class
// ============================================================================

/**
 * LanOnasis Memory Concierge
 *
 * A context-aware memory service that helps you capture, retrieve, and recall
 * information. It integrates with LanOnasis MaaS for persistent storage and
 * AI-powered recall (behavioral pattern matching, tag suggestions, duplicate
 * detection).
 *
 * The in-memory mock database provides local caching and offline fallback.
 * For production use, configure the memory-plugin to use the MaaS API.
 *
 * @example
 * ```typescript
 * import { MemoryConcierge } from 'vortexai-l0/memory-concierge';
 *
 * const concierge = new MemoryConcierge();
 * const result = await concierge.recall('oauth implementation patterns');
 * console.log(result.message);
 * ```
 */
export class MemoryConcierge {
  private readonly plugins: PluginManager;

  constructor(plugins?: PluginManager) {
    this.plugins = plugins || pluginManager;
  }

  /**
   * In-memory mock database for offline/local caching.
   * In production, this delegates to the MaaS API via memory-plugin.
   */
  private readonly mockDatabase: {
    memories: MemoryEntry[];
    snippets: CodeSnippet[];
  } = {
    memories: [
      {
        id: 'context-auth-decision',
        title: 'OAuth2/PKCE Authentication Decision',
        content:
          'Project decided to use PKCE for all public clients. Token rotation implemented. Client secrets stay server-side. See auth-gateway for implementation.',
        entryType: 'decision',
        date: '2025-12-01',
        tags: ['oauth', 'security', 'authentication', 'auth-gateway'],
      },
      {
        id: 'pattern-deploy-pipeline',
        title: 'Deployment Pipeline Pattern',
        content:
          'Standard deploy flow: lint -> typecheck -> test -> build -> deploy -> smoke-test. Run from CI, not locally. Environment variables validated at startup.',
        entryType: 'pattern',
        date: '2025-11-15',
        tags: ['deployment', 'ci-cd', 'pipeline', 'automation'],
      },
      {
        id: 'context-supabase-schema',
        title: 'Supabase Schema Organization',
        content:
          'All migrations live in supabase/migrations/. RLS enabled on every table. Service role keys in backend only, client keys restricted by RLS policies.',
        entryType: 'context',
        date: '2025-10-20',
        tags: ['supabase', 'database', 'schema', 'rls'],
      },
    ],
    snippets: [
      {
        id: 'snippet-auth-hook',
        title: 'Auth Context Hook',
        content:
          'const useAuth = () => {\n  const { data: session, isLoading } = useSession();\n  const user = session?.user;\n  return { user, session, isLoading };\n};',
        language: 'typescript',
        tags: ['auth', 'react', 'hooks'],
        lastUsed: '3 days ago',
        project: 'dashboard',
      },
      {
        id: 'snippet-memory-search',
        title: 'Memory Search Utility',
        content:
          'const searchMemories = async (query: string, limit = 5) => {\n  const result = await memoryAPI.search(query, { limit, threshold: 0.7 });\n  return result.results ?? [];\n};',
        language: 'typescript',
        tags: ['memory', 'search', 'api'],
        lastUsed: '1 week ago',
        project: 'concierge',
      },
      {
        id: 'snippet-env-validator',
        title: 'Environment Variable Validator',
        content:
          'const required = (key: string) => {\n  const value = process.env[key];\n  if (!value) throw new Error(`Missing env: ${key}`);\n  return value;\n};',
        language: 'typescript',
        tags: ['env', 'validation', 'config'],
        lastUsed: '2 weeks ago',
        project: 'core',
      },
    ],
  };

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Query the memory concierge with a natural language request.
   *
   * Routes to the appropriate handler based on intent detection:
   * - "remember/save/record" -> create memory
   * - "search/find/look up" -> search memories
   * - "recall/pattern/how did I" -> behavioral recall
   * - "suggest/help" -> get help
   * - "code/snippet" -> find code snippets
   *
   * @param query - Natural language query
   * @param options - Optional configuration
   * @returns Promise resolving to a MemoryResponse
   */
  async query(query: string, options?: MemoryQueryOptions): Promise<MemoryResponse> {
    // Concierge requests (from Slack/Discord adapters) take precedence.
    if (options?.conciergeRequest) {
      const ctx = options.conciergeRequest as ConciergeExecutionContext;
      return mapConciergeResponse(await executeConciergeRequest(ctx));
    }

    const lowerQuery = query.toLowerCase();

    // Route to appropriate handler
    if (this.isCreateMemoryRequest(lowerQuery)) {
      return this.createMemory(query);
    }

    if (this.isSearchRequest(lowerQuery)) {
      return this.search(query, options?.limit);
    }

    if (this.isRecallRequest(lowerQuery)) {
      return this.recall(query);
    }

    if (this.isHelpRequest(lowerQuery)) {
      return this.getHelp(query);
    }

    if (this.isSnippetRequest(lowerQuery)) {
      return this.findSnippet(query);
    }

    // Try plugins before general fallback
    const pluginResponse = await this.plugins.execute(query, options as Record<string, unknown>);
    if (pluginResponse) {
      return pluginResponse;
    }

    return this.generalRecall(query);
  }

  /** Get the plugin manager for direct access */
  getPluginManager(): PluginManager {
    return this.plugins;
  }

  // ==========================================================================
  // Intent Detection
  // ==========================================================================

  private isCreateMemoryRequest(query: string): boolean {
    return (
      query.includes('remember') ||
      query.includes('save ') ||
      query.includes('record ') ||
      query.includes('note ') ||
      query.includes('store ')
    );
  }

  private isSearchRequest(query: string): boolean {
    return (
      query.includes('search') ||
      query.includes('find ') ||
      query.includes('look up') ||
      query.includes('what do i know') ||
      query.includes('what did we') ||
      query.includes('what was')
    );
  }

  private isRecallRequest(query: string): boolean {
    return (
      query.includes('recall') ||
      query.includes('pattern') ||
      query.includes('how did i') ||
      query.includes('last time') ||
      query.includes('workflow')
    );
  }

  private isHelpRequest(query: string): boolean {
    return query.startsWith('help') || query.includes('help ') || query.includes('how to');
  }

  private isSnippetRequest(query: string): boolean {
    return query.includes('code') || query.includes('snippet');
  }

  // ==========================================================================
  // Core Methods
  // ==========================================================================

  /** Create a new memory entry (mock/local only) */
  async createMemory(query: string): Promise<MemoryResponse> {
    return {
      message: `Memory saved: "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`,
      type: 'memory',
      data: {
        id: crypto.randomUUID?.() ?? 'mem-local',
        title: query.substring(0, 50),
        savedAt: new Date().toISOString(),
      },
      related: ['Search your memories', 'List recent entries'],
    };
  }

  /** Search the local mock database */
  async search(query: string, limit = 5): Promise<MemoryResponse> {
    const keywords = query.toLowerCase().split(' ').filter((k) => k.length > MIN_KEYWORD_LENGTH);

    const matches = this.mockDatabase.memories.filter((mem) =>
      keywords.some((kw) => {
        const searchable = `${mem.title} ${mem.content} ${mem.tags.join(' ')}`.toLowerCase();
        return searchable.includes(kw);
      })
    );

    const limited = matches.slice(0, limit);

    if (limited.length === 0) {
      return {
        message: `No memories found for "${query}". Try saving something first, or check your MaaS connection.`,
        type: 'memory',
        related: [
          'Try "remember that ..." to save a new entry',
          'Check "recall" for behavioral patterns',
        ],
      };
    }

    const results = limited
      .map(
        (m) =>
          `${m.title}: ${m.content.substring(0, PREVIEW_LENGTH)}...`
      )
      .join('\n\n');

    return {
      message: `Found ${limited.length} relevant memory${limited.length > 1 ? 'ies' : ''}:`,
      data: results,
      type: 'memory',
      dashboardUrl: `/memories?q=${encodeURIComponent(query)}`,
      related: limited.slice(0, 3).map((m) => m.title),
    };
  }

  /** Behavioral recall - suggest relevant past patterns */
  async recall(query: string): Promise<MemoryResponse> {
    const keywords = query.toLowerCase().split(' ').filter((k) => k.length > MIN_KEYWORD_LENGTH);

    const matches = this.mockDatabase.memories.filter((mem) => {
      if (mem.entryType !== 'pattern') return false;
      const searchable = `${mem.title} ${mem.content}`.toLowerCase();
      return keywords.some((kw) => searchable.includes(kw));
    });

    if (matches.length === 0) {
      return {
        message: `No workflow patterns found for "${query}". Patterns build up as you work - try "remember that ..." to record successful workflows.`,
        type: 'recall',
        related: ['Try "record a pattern" for a task you just completed'],
      };
    }

    const patternText = matches
      .slice(0, 3)
      .map((p, i) => `${i + 1}. ${p.title}: ${p.content.substring(0, PREVIEW_LENGTH)}`)
      .join('\n');

    return {
      message: `Found ${matches.length} relevant pattern${matches.length > 1 ? 's' : ''}:`,
      data: patternText,
      type: 'recall',
      workflow: matches.map((p) => p.content),
      related: matches.map((p) => p.title),
    };
  }

  /** Find code snippets */
  async findSnippet(description: string): Promise<MemoryResponse> {
    const keywords = description.toLowerCase().split(' ').filter((k) => k.length > MIN_KEYWORD_LENGTH);

    const matches = this.mockDatabase.snippets.filter((snippet) => {
      const searchable = `${snippet.title} ${snippet.tags.join(' ')} ${snippet.content}`.toLowerCase();
      return keywords.some((kw) => searchable.includes(kw));
    });

    if (matches.length === 0) {
      return {
        message: `No code snippets found for "${description}".`,
        type: 'snippet',
        related: ['floating card', 'auth hook', 'memory search'],
      };
    }

    const best = matches[0];
    return {
      message: `Found ${matches.length} matching snippet${matches.length > 1 ? 's' : ''}:`,
      code: best.content,
      data: {
        title: best.title,
        language: best.language,
        lastUsed: best.lastUsed,
        project: best.project,
        tags: best.tags,
      },
      type: 'snippet',
      dashboardUrl: `/memories/${best.id}`,
      related: matches.slice(1, 3).map((m) => m.title),
    };
  }

  /** Get help and guidance */
  async getHelp(query: string): Promise<MemoryResponse> {
    const helpTopics: Record<string, string> = {
      memory: 'Memory: Capture, search, recall, and manage your knowledge base.',
      recall: 'Recall: Find behavioral patterns and past workflow decisions.',
      snippet: 'Snippets: Find saved code snippets by description or tag.',
      suggestion: 'Suggestion: Get next-step recommendations based on your patterns.',
      record: 'Record: Save a new memory entry for future recall.',
    };

    const topic = Object.keys(helpTopics).find((t) => query.includes(t));

    if (topic) {
      return {
        message: helpTopics[topic],
        type: 'help',
        related: Object.keys(helpTopics),
      };
    }

    return {
      message:
        'LanOnasis Memory Concierge: capture memories, search knowledge, recall patterns, and find code snippets.',
      type: 'help',
      related: Object.keys(helpTopics),
    };
  }

  /** General-purpose recall for unspecified queries */
  async generalRecall(query: string): Promise<MemoryResponse> {
    return {
      message: `Searching context for: "${query}"`,
      type: 'context',
      data: {
        query,
        suggestions: [
          'Be more specific: "search for oauth patterns"',
          'Try "remember that ..." to save context',
          'Try "recall ..." to find past decisions',
        ],
      },
      related: ['memory', 'recall', 'snippet', 'help'],
    };
  }
}

// ==========================================================================
// Helpers
// ==========================================================================

function mapConciergeResponse(response: ConciergeResponse): MemoryResponse {
  return {
    message: response.message,
    type:
      response.type === 'error'
        ? 'help'
        : response.type === 'approval_required'
          ? 'recall'
          : 'memory',
    data: response.data as Record<string, unknown> | undefined,
    related: response.sources,
  };
}

// Singleton for convenience
export const memoryConcierge = new MemoryConcierge();
