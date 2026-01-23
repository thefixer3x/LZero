/**
 * LanOnasis Memory Services Plugin for VortexAI L0
 *
 * Lean, self-contained integration with Memory-as-a-Service.
 * No SDK dependencies - direct REST API calls only.
 *
 * @module memory-plugin
 */

import type { L0Plugin, PluginContext } from './plugins.js';
import type { L0Response } from './orchestrator.js';

// ============================================================================
// Configuration
// ============================================================================

export interface MemoryPluginConfig {
  apiUrl: string;
  authToken?: string;
  userId?: string;
  timeout?: number;
}

/**
 * Safe environment variable accessor (works in browser and Node.js)
 */
function getEnvVar(key: string): string | undefined {
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    return (globalThis as any).process?.env?.[key];
  }
  return undefined;
}

let pluginConfig: MemoryPluginConfig = {
  apiUrl: getEnvVar('LANONASIS_API_URL') || 'https://api.lanonasis.com',
  authToken: getEnvVar('LANONASIS_API_KEY'),
  userId: getEnvVar('LANONASIS_USER_ID'),
  timeout: 30000,
};

/**
 * Configure the memory plugin
 */
export function configureMemoryPlugin(config: Partial<MemoryPluginConfig>): void {
  pluginConfig = { ...pluginConfig, ...config };
}

// ============================================================================
// REST API Helpers (Lean - No SDK)
// ============================================================================

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success?: boolean;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { apiUrl, authToken, timeout } = pluginConfig;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return { error: `API error (${response.status}): ${errorText}` };
    }

    const data = await response.json() as T;
    return { data, success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return { error: 'Request timed out' };
    }
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// Memory Operations (CRUD)
// ============================================================================

interface Memory {
  id: string;
  title: string;
  content: string;
  memory_type: string;
  tags?: string[];
  similarity?: number;
  created_at?: string;
}

interface SearchResult {
  results: Memory[];
  total?: number;
}

async function searchMemories(query: string, limit = 5): Promise<ApiResponse<SearchResult>> {
  return apiCall<SearchResult>('/api/v1/memory/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit, threshold: 0.65 }),
  });
}

async function createMemory(
  title: string,
  content: string,
  type = 'context',
  tags: string[] = []
): Promise<ApiResponse<Memory>> {
  return apiCall<Memory>('/api/v1/memory', {
    method: 'POST',
    body: JSON.stringify({ title, content, memory_type: type, tags }),
  });
}

async function listMemories(limit = 10): Promise<ApiResponse<{ data: Memory[] }>> {
  return apiCall<{ data: Memory[] }>(`/api/v1/memory?limit=${limit}`);
}

async function getMemory(id: string): Promise<ApiResponse<Memory>> {
  return apiCall<Memory>(`/api/v1/memory/${id}`);
}

async function deleteMemory(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiCall<{ deleted: boolean }>(`/api/v1/memory/${id}`, { method: 'DELETE' });
}

// ============================================================================
// Intelligence Operations
// ============================================================================

interface TagSuggestion {
  tag: string;
  confidence: number;
}

interface RelatedMemory {
  memory: Memory;
  similarity: number;
}

async function suggestTags(memoryId: string): Promise<ApiResponse<{ suggestions: TagSuggestion[] }>> {
  return apiCall('/api/v1/intelligence/suggest-tags', {
    method: 'POST',
    body: JSON.stringify({ memory_id: memoryId, user_id: pluginConfig.userId }),
  });
}

async function findRelated(memoryId: string, limit = 5): Promise<ApiResponse<{ related: RelatedMemory[] }>> {
  return apiCall('/api/v1/intelligence/find-related', {
    method: 'POST',
    body: JSON.stringify({ memory_id: memoryId, user_id: pluginConfig.userId, limit }),
  });
}

// ============================================================================
// Behavior Operations
// ============================================================================

interface BehaviorPattern {
  trigger: string;
  actions: string[];
  confidence: number;
  lastUsed?: string;
}

async function recallBehavior(
  currentTask: string,
  currentDirectory?: string
): Promise<ApiResponse<{ patterns: BehaviorPattern[] }>> {
  return apiCall('/api/v1/behavior/recall', {
    method: 'POST',
    body: JSON.stringify({
      user_id: pluginConfig.userId,
      context: { current_task: currentTask, current_directory: currentDirectory },
      limit: 3,
    }),
  });
}

async function suggestNextAction(
  taskDescription: string,
  completedSteps: string[] = []
): Promise<ApiResponse<{ suggestions: string[] }>> {
  return apiCall('/api/v1/behavior/suggest', {
    method: 'POST',
    body: JSON.stringify({
      user_id: pluginConfig.userId,
      current_state: { task_description: taskDescription, completed_steps: completedSteps },
    }),
  });
}

async function detectDuplicates(
  threshold = 0.9
): Promise<ApiResponse<{ duplicates: Array<{ memory1: Memory; memory2: Memory; similarity: number }> }>> {
  return apiCall('/api/v1/intelligence/detect-duplicates', {
    method: 'POST',
    body: JSON.stringify({
      user_id: pluginConfig.userId,
      similarity_threshold: threshold,
      max_pairs: 10,
    }),
  });
}

interface RecordPatternInput {
  trigger: string;
  actions: string[];
  context?: {
    directory?: string;
    project_type?: string;
    files_touched?: string[];
  };
  outcome: 'success' | 'partial' | 'failed';
  confidence?: number;
}

async function recordPattern(
  input: RecordPatternInput
): Promise<ApiResponse<{ pattern_id: string; recorded: boolean }>> {
  return apiCall('/api/v1/behavior/record', {
    method: 'POST',
    body: JSON.stringify({
      user_id: pluginConfig.userId,
      trigger: input.trigger,
      context: input.context || { directory: typeof globalThis !== 'undefined' && 'process' in globalThis ? (globalThis as any).process?.cwd?.() || '/' : '/' },
      actions: input.actions.map((action, i) => ({
        tool: action,
        parameters: {},
        outcome: input.outcome,
        timestamp: new Date().toISOString(),
      })),
      final_outcome: input.outcome,
      confidence: input.confidence || 0.8,
    }),
  });
}

// ============================================================================
// Intent Detection & Response Formatting
// ============================================================================

type MemoryIntent =
  | 'search' | 'create' | 'list' | 'delete'
  | 'recall' | 'suggest_tags' | 'find_related' | 'detect_duplicates'
  | 'suggest_next' | 'record_pattern' | 'unknown';

function detectIntent(query: string): MemoryIntent {
  const q = query.toLowerCase();

  // === Intelligence Intents ===
  // Tag suggestions
  if (q.includes('suggest tags') || q.includes('tag this') || q.includes('what tags') || q.includes('auto tag')) {
    return 'suggest_tags';
  }
  // Related memories
  if (q.includes('related') || q.includes('similar') || q.includes('like this') || q.includes('connections')) {
    return 'find_related';
  }
  // Duplicate detection
  if (q.includes('duplicate') || q.includes('duplicates') || q.includes('redundant') || q.includes('cleanup')) {
    return 'detect_duplicates';
  }

  // === Behavioral Intents ===
  // Pattern recall (existing)
  if (q.includes('pattern') || q.includes('workflow') || q.includes('how did i') || q.includes('last time')) {
    return 'recall';
  }
  // Next action suggestions
  if (q.includes('what next') || q.includes('next step') || q.includes('suggest action') || q.includes('what should i')) {
    return 'suggest_next';
  }
  // Record successful pattern
  if (q.includes('record this') || q.includes('save workflow') || q.includes('learn this') || q.includes('that worked')) {
    return 'record_pattern';
  }

  // === Core Memory Intents ===
  if (q.includes('remember') || q.includes('save') || q.includes('store') || q.includes('note')) {
    return 'create';
  }
  if (q.includes('search') || q.includes('find') || q.includes('what do i know') || q.includes('look for')) {
    return 'search';
  }
  if (q.includes('list') || q.includes('show') || q.includes('my memories')) {
    return 'list';
  }
  if (q.includes('delete') || q.includes('remove') || q.includes('forget')) {
    return 'delete';
  }

  return 'unknown';
}

function extractContent(query: string, intent: string): string {
  const patterns: Record<string, RegExp> = {
    create: /^(?:remember|save|store|note)\s+(?:that\s+)?(.+)$/i,
    search: /^(?:search|find|what do i know about|look for)\s+(.+)$/i,
    delete: /^(?:delete|remove|forget)\s+(.+)$/i,
  };

  const pattern = patterns[intent];
  if (pattern) {
    const match = query.match(pattern);
    return match ? match[1].trim() : query;
  }
  return query;
}

function formatMemoryResponse(memories: Memory[], action: string): L0Response {
  if (memories.length === 0) {
    return {
      message: `No memories found. Your knowledge base is ready to grow!`,
      type: 'memory',
      related: ['Try: "remember that..." to save something'],
    };
  }

  const formatted = memories
    .slice(0, 5)
    .map((m, i) => `${i + 1}. **${m.title}**\n   ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`)
    .join('\n\n');

  return {
    message: `Found ${memories.length} relevant ${memories.length === 1 ? 'memory' : 'memories'}:`,
    type: 'memory',
    data: formatted,
    related: memories.slice(0, 3).map((m) => m.title),
  };
}

// ============================================================================
// Main Plugin Handler
// ============================================================================

async function memoryPluginHandler(ctx: PluginContext): Promise<L0Response> {
  const { query } = ctx;
  const intent = detectIntent(query);
  const content = extractContent(query, intent);

  try {
    switch (intent) {
      case 'search': {
        const result = await searchMemories(content);
        if (result.error) {
          return {
            message: `Search failed: ${result.error}`,
            type: 'memory',
            related: ['Check your connection', 'Try again'],
          };
        }
        return formatMemoryResponse(result.data?.results || [], 'search');
      }

      case 'create': {
        if (!content || content.length < 3) {
          return {
            message: 'What would you like me to remember? Tell me more!',
            type: 'memory',
          };
        }
        const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        const result = await createMemory(title, content);
        if (result.error) {
          return {
            message: `Could not save: ${result.error}`,
            type: 'memory',
          };
        }
        return {
          message: `Saved! "${title}"`,
          type: 'memory',
          data: { id: result.data?.id, title },
          related: ['Search your memories', 'List recent'],
        };
      }

      case 'list': {
        const result = await listMemories(10);
        if (result.error) {
          return {
            message: `Could not list memories: ${result.error}`,
            type: 'memory',
          };
        }
        return formatMemoryResponse(result.data?.data || [], 'list');
      }

      case 'delete': {
        // Check for UUID pattern
        const idMatch = content.match(/[a-f0-9-]{36}/i);
        if (!idMatch) {
          return {
            message: 'To delete, I need the memory ID. Try "list" first to see IDs.',
            type: 'memory',
            related: ['list memories', 'show my memories'],
          };
        }
        const result = await deleteMemory(idMatch[0]);
        if (result.error) {
          return {
            message: `Could not delete: ${result.error}`,
            type: 'memory',
          };
        }
        return {
          message: `Deleted memory ${idMatch[0].substring(0, 8)}...`,
          type: 'memory',
        };
      }

      case 'recall': {
        const result = await recallBehavior(content);
        if (result.error || !result.data?.patterns?.length) {
          return {
            message: 'No matching patterns found. Keep using the system to build your workflow memory!',
            type: 'memory',
          };
        }
        const patterns = result.data.patterns
          .map((p, i) => `${i + 1}. ${p.trigger} (${Math.round(p.confidence * 100)}% match)`)
          .join('\n');
        return {
          message: `Found relevant workflow patterns:\n${patterns}`,
          type: 'memory',
          workflow: result.data.patterns[0]?.actions,
        };
      }

      // ========== Intelligence Features ==========

      case 'suggest_tags': {
        // Extract memory ID from query or use context
        const idMatch = content.match(/[a-f0-9-]{36}/i);
        if (!idMatch) {
          return {
            message: '🏷️ To suggest tags, I need a memory ID. Try "list" first to see your memories.',
            type: 'memory',
            related: ['list memories', 'show recent'],
          };
        }
        const result = await suggestTags(idMatch[0]);
        if (result.error || !result.data?.suggestions?.length) {
          return {
            message: 'Could not generate tag suggestions. The memory may not have enough content.',
            type: 'memory',
          };
        }
        const tags = result.data.suggestions
          .map((s) => `• ${s.tag} (${Math.round(s.confidence * 100)}% confidence)`)
          .join('\n');
        return {
          message: `🏷️ Suggested tags for this memory:\n${tags}`,
          type: 'memory',
          data: { suggestions: result.data.suggestions },
          related: ['Apply these tags', 'Search by tag'],
        };
      }

      case 'find_related': {
        const idMatch = content.match(/[a-f0-9-]{36}/i);
        if (!idMatch) {
          // Try to find related based on content
          const searchResult = await searchMemories(content, 5);
          if (searchResult.data?.results?.length) {
            return formatMemoryResponse(searchResult.data.results, 'related');
          }
          return {
            message: '🔗 To find related memories, describe what you\'re looking for or provide a memory ID.',
            type: 'memory',
          };
        }
        const result = await findRelated(idMatch[0], 5);
        if (result.error || !result.data?.related?.length) {
          return {
            message: 'No related memories found. Your knowledge graph will grow as you add more!',
            type: 'memory',
          };
        }
        const related = result.data.related
          .map((r, i) => `${i + 1}. **${r.memory.title}** (${Math.round(r.similarity * 100)}% similar)\n   ${r.memory.content.substring(0, 80)}...`)
          .join('\n\n');
        return {
          message: `🔗 Found ${result.data.related.length} related memories:\n\n${related}`,
          type: 'memory',
          related: result.data.related.slice(0, 3).map((r) => r.memory.title),
        };
      }

      case 'detect_duplicates': {
        const result = await detectDuplicates(0.85);
        if (result.error) {
          return {
            message: `Could not scan for duplicates: ${result.error}`,
            type: 'memory',
          };
        }
        if (!result.data?.duplicates?.length) {
          return {
            message: '✨ No duplicates found! Your memory collection is clean.',
            type: 'memory',
            related: ['List memories', 'Search for something'],
          };
        }
        const dupes = result.data.duplicates
          .map((d, i) => `${i + 1}. "${d.memory1.title}" ↔ "${d.memory2.title}" (${Math.round(d.similarity * 100)}% similar)`)
          .join('\n');
        return {
          message: `🔍 Found ${result.data.duplicates.length} potential duplicates:\n\n${dupes}\n\n💡 Say "delete [id]" to remove unwanted copies.`,
          type: 'memory',
          data: { duplicates: result.data.duplicates },
        };
      }

      // ========== Behavioral Features ==========

      case 'suggest_next': {
        // Extract task context from query
        const taskMatch = content.match(/(?:for|on|with)\s+(.+?)(?:\?|$)/i);
        const task = taskMatch ? taskMatch[1] : content;

        const result = await suggestNextAction(task, []);
        if (result.error || !result.data?.suggestions?.length) {
          return {
            message: '🤔 I don\'t have enough context yet to suggest next steps. Keep working and I\'ll learn your patterns!',
            type: 'memory',
          };
        }
        const suggestions = result.data.suggestions
          .map((s, i) => `${i + 1}. ${s}`)
          .join('\n');
        return {
          message: `💡 Based on your patterns, here's what to do next:\n\n${suggestions}`,
          type: 'memory',
          workflow: result.data.suggestions,
          related: ['Show my patterns', 'Record this workflow'],
        };
      }

      case 'record_pattern': {
        // Parse the workflow from the query
        const actionsMatch = content.match(/(?:steps?|actions?|workflow):\s*(.+)/i);
        const triggerMatch = content.match(/(?:for|when|trigger):\s*(.+?)(?:steps|actions|$)/i);

        if (!actionsMatch && !triggerMatch) {
          return {
            message: `📝 To record a workflow pattern, tell me:\n• What triggered it: "for: [task description]"\n• What steps worked: "steps: [action1, action2, ...]"\n\nExample: "record this for: debugging auth, steps: check logs, verify tokens, test endpoint"`,
            type: 'memory',
          };
        }

        const trigger = triggerMatch?.[1]?.trim() || content.substring(0, 50);
        const actions = actionsMatch?.[1]?.split(/[,;]/).map(a => a.trim()).filter(Boolean) || [content];

        const result = await recordPattern({
          trigger,
          actions,
          outcome: 'success',
          confidence: 0.8,
        });

        if (result.error) {
          return {
            message: `Could not record pattern: ${result.error}`,
            type: 'memory',
          };
        }
        return {
          message: `✅ Workflow pattern recorded!\n\n📌 Trigger: "${trigger}"\n📋 Steps: ${actions.join(' → ')}\n\nI'll suggest this pattern when you work on similar tasks.`,
          type: 'memory',
          data: { pattern_id: result.data?.pattern_id },
          related: ['Show my patterns', 'What\'s my workflow for...'],
        };
      }

      default:
        // Unknown intent - do a search as fallback
        const fallbackResult = await searchMemories(query, 3);
        if (fallbackResult.data?.results?.length) {
          return formatMemoryResponse(fallbackResult.data.results, 'search');
        }
        return {
          message: `I can help you with your memories! Try:\n• "remember that..." to save\n• "search for..." to find\n• "show my memories" to list`,
          type: 'help',
        };
    }
  } catch (error) {
    return {
      message: `Memory service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'memory',
      related: ['Check connection', 'Try again'],
    };
  }
}

// ============================================================================
// Plugin Export
// ============================================================================

/**
 * LanOnasis Memory Services Plugin
 *
 * Provides context-aware memory operations for VortexAI L0.
 * Lean implementation - no external SDK dependencies.
 */
export const memoryServicesPlugin: L0Plugin = {
  metadata: {
    name: 'memory-services',
    version: '1.0.0',
    description: 'LanOnasis Memory-as-a-Service integration - context-aware memory operations',
    author: 'LanOnasis',
    keywords: ['memory', 'context', 'knowledge', 'semantic-search', 'lanonasis', 'maas'],
  },
  triggers: [
    // Core Memory
    'remember', 'recall', 'find', 'search', 'what do i know',
    'save', 'store', 'note', 'list', 'show', 'my memories',
    'delete', 'remove', 'forget',
    // Intelligence
    'suggest tags', 'tag this', 'auto tag', 'what tags',
    'related', 'similar', 'like this', 'connections',
    'duplicate', 'duplicates', 'redundant', 'cleanup',
    // Behavioral
    'pattern', 'workflow', 'how did i', 'last time',
    'what next', 'next step', 'suggest action', 'what should i',
    'record this', 'save workflow', 'learn this', 'that worked',
  ],
  priority: 100, // High priority - core memory operations
  handler: memoryPluginHandler,
};

// ============================================================================
// Standalone API (for direct use without plugin system)
// ============================================================================

export const memoryAPI = {
  // Configuration
  configure: configureMemoryPlugin,

  // Core CRUD
  search: searchMemories,
  create: createMemory,
  list: listMemories,
  get: getMemory,
  delete: deleteMemory,

  // Intelligence Features
  suggestTags,
  findRelated,
  detectDuplicates,

  // Behavioral Features
  recallBehavior,
  suggestNextAction,
  recordPattern,
};

export default memoryServicesPlugin;
