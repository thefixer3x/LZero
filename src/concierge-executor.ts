import type { ConciergeRequest, ConciergeResponse, ToolCallRequest } from './concierge-contract.js';
import { classifyTool, requiresApproval } from './concierge-contract.js';

/**
 * L0ConciergeExecutor is the bridge between chat-platform adapters and VortexAI-L0.
 *
 * It accepts a platform-agnostic ConciergeRequest, assembles context
 * (memory search, active project, user permissions), and returns a ConciergeResponse.
 *
 * Answer synthesis is delegated to onasis-ai-router (`POST /api/v1/ai-chat`), the
 * same backend that powers the IDE-extension concierge and repl-cli. The router
 * owns persona/identity server-side (promptComposer) and performs its own memory
 * retrieval via its `memory.search`/`memory.get` tools, so this executor does NOT
 * hand-roll a system prompt or double-search memories on the happy path.
 *
 * Fallback contract ("never go fully silent"): if the ai-chat call fails for any
 * reason (network, non-200, timeout), we degrade to the local template answer
 * built from a direct MaaS memory search, and only if that also fails do we
 * return the generic error message.
 *
 * Mutation safety: the `detectCandidateTool`/`ApprovalEngine` gate runs BEFORE
 * any network call, so mutation intents never reach the router. The router call
 * sends NO `tools` array — the router's per-use-case default for memory-analysis
 * is read-only (memory.search + memory.get only; memory.write is not offered,
 * see commit 3db9287). The executor's approval gate remains the ONLY mutation
 * path for this integration.
 */

export interface ConciergeExecutionContext {
  request: ConciergeRequest;
  memoryApiUrl: string;
  memoryAuthToken?: string;
  /** Base URL of onasis-ai-router (defaults to $AI_ROUTER_URL or https://ai.vortexcore.app). */
  aiRouterUrl?: string;
  /** Router request timeout in ms (defaults to $AI_ROUTER_TIMEOUT_MS or 90000). */
  aiRouterTimeoutMs?: number;
  mcpApiUrl?: string;
  mcpApiKey?: string;
  l0Orchestrator?: unknown;
}

export interface MemoryResult {
  id: string;
  title: string;
  content: string;
  memory_type: string;
  similarity?: number;
}

const DEFAULT_AI_ROUTER_URL = 'https://ai.vortexcore.app';
const DEFAULT_AI_ROUTER_TIMEOUT_MS = 90_000;

/**
 * Safe environment variable accessor (works in browser and Node.js) — matches
 * memory-plugin.ts so the browser build has no hard Node dependency.
 */
function getEnvVar(key: string): string | undefined {
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    return (globalThis as any).process?.env?.[key];
  }
  return undefined;
}

export async function executeConciergeRequest(
  ctx: ConciergeExecutionContext
): Promise<ConciergeResponse> {
  const { request } = ctx;

  // Naive intent detection: if the request looks like a command to mutate state,
  // treat it as a productive action that may require approval.
  // Runs BEFORE any network call — mutation intents never reach the router.
  const candidateTool = detectCandidateTool(request.input.text);
  if (candidateTool) {
    const toolClass = classifyTool(candidateTool);
    if (requiresApproval(candidateTool)) {
      return {
        message: `I can run **${candidateTool}** (${toolClass}), but this requires your approval first.`,
        type: 'approval_required',
        proposedAction: {
          tool: candidateTool,
          arguments: buildToolArguments(candidateTool, request),
          class: toolClass,
        },
        approvalId: `apr-${request.requestId}`,
      };
    }
  }

  // Primary path: synthesize the answer via onasis-ai-router. The router does
  // its own memory retrieval (prefetch + memory.search tool), so no separate
  // client-side search is needed on this path.
  try {
    const answer = await callAIRouter(ctx);
    if (answer) {
      return {
        message: answer,
        type: 'answer',
        data: {
          scope: request.scope,
          source: 'ai-router',
          useCase: 'memory-analysis',
        },
      };
    }
  } catch (error) {
    // Router unavailable / failed — fall through to the template fallback.
    // Deliberately NOT surfaced to the user: never go fully silent, and the
    // degraded answer is more useful than an error dump.
  }

  // Fallback path: direct MaaS memory search + local template answer.
  try {
    const memories = await fetchRelevantMemories(ctx);
    const contextSummary = buildContextSummary(request, memories);

    return {
      message: formatAnswer(request.input.text, memories, contextSummary),
      type: 'answer',
      data: {
        memoryCount: memories.length,
        scope: request.scope,
        sources: memories.map((m) => m.id),
        source: 'memory-search-fallback',
      },
      sources: memories.map((m) => m.title),
    };
  } catch (error) {
    return {
      message: 'I found your account but could not reach MaaS right now.',
      type: 'error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Call onasis-ai-router `POST /api/v1/ai-chat`.
 *
 * Auth follows repl-cli's ai-router-client.ts convention: `lano_*` service keys
 * go in `X-API-Key`; anything else (OAuth JWT / Bearer) goes in
 * `Authorization: Bearer`. The router resolves the credential via
 * AUTH_GATEWAY_URL/v1/auth/resolve. Response shape: `{ response, actions?, ... }`
 * — read `payload.response` (with `payload.message?.content` as a defensive
 * alias, matching repl-cli).
 */
async function callAIRouter(ctx: ConciergeExecutionContext): Promise<string> {
  const { request, memoryAuthToken } = ctx;
  const baseUrl = (ctx.aiRouterUrl || getEnvVar('AI_ROUTER_URL') || DEFAULT_AI_ROUTER_URL).trim().replace(/\/+$/, '');
  const timeoutMs = ctx.aiRouterTimeoutMs ?? parseInt(getEnvVar('AI_ROUTER_TIMEOUT_MS') || String(DEFAULT_AI_ROUTER_TIMEOUT_MS), 10);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildRouterAuthHeaders(memoryAuthToken),
      },
      body: JSON.stringify({
        use_case: 'memory-analysis',
        messages: [{ role: 'user', content: request.input.text }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI Router request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      response?: string;
      message?: { content?: string };
      error?: { message?: string };
    };

    if (data.error?.message) {
      throw new Error(data.error.message);
    }

    return (data.response || data.message?.content || '').trim();
  } finally {
    clearTimeout(timeout);
  }
}

function buildRouterAuthHeaders(token?: string): Record<string, string> {
  if (!token) return {};
  const t = token.trim();
  if (t.startsWith('lano_')) {
    return { 'X-API-Key': t };
  }
  if (t.toLowerCase().startsWith('bearer ')) {
    return { Authorization: t };
  }
  if (t.includes('.') && t.length > 100) {
    // Likely an OAuth JWT
    return { Authorization: `Bearer ${t}` };
  }
  return { Authorization: `Bearer ${t}` };
}

async function fetchRelevantMemories(ctx: ConciergeExecutionContext): Promise<MemoryResult[]> {
  const { request, memoryApiUrl, memoryAuthToken } = ctx;

  const response = await fetch(`${memoryApiUrl}/api/v1/memory/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(memoryAuthToken && { Authorization: `Bearer ${memoryAuthToken}` }),
    },
    body: JSON.stringify({
      query: request.input.text,
      limit: 5,
      tags: request.scope.project ? [request.scope.project] : undefined,
      threshold: 0.65,
      status: 'active',
    }),
  });

  if (!response.ok) {
    throw new Error(`MaaS search failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    data?: { results?: MemoryResult[] };
    error?: string;
  };

  if (json.error) {
    throw new Error(json.error);
  }

  return json.data?.results ?? [];
}

function buildContextSummary(request: ConciergeRequest, memories: MemoryResult[]): string {
  const parts: string[] = [
    `Project: ${request.scope.project ?? 'default'}`,
    `Tenant: ${request.scope.tenant ?? 'unknown'}`,
    `Channel: ${request.scope.channel ?? 'unknown'}`,
    `Memories available: ${memories.length}`,
  ];
  return parts.join('\n');
}

function formatAnswer(query: string, memories: MemoryResult[], summary: string): string {
  if (memories.length === 0) {
    return `I searched your memory for “${query}” and found nothing relevant.`;
  }

  const lines = memories.slice(0, 5).map((m, i) => {
    const score = m.similarity ? ` (${(m.similarity * 100).toFixed(0)}%)` : '';
    return `${i + 1}. *${m.title}*${score}\n> ${m.content.split('\n')[0].slice(0, 200)}`;
  });

  return `I found ${memories.length} relevant memories for “${query}”:\n\n${lines.join('\n\n')}\n\n_Context_\n${summary}`;
}

function detectCandidateTool(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('create api key')) return 'api_key_create';
  if (lower.includes('delete api key')) return 'api_key_delete';
  if (lower.includes('rotate api key')) return 'api_key_rotate';
  if (lower.includes('create memory')) return 'memory_create';
  if (lower.includes('delete memory')) return 'memory_delete';
  if (lower.includes('update memory')) return 'memory_update';
  if (lower.includes('deploy')) return 'deploy_service';
  return undefined;
}

function buildToolArguments(tool: string, request: ConciergeRequest): Record<string, unknown> {
  switch (tool) {
    case 'memory_create':
      return {
        title: request.input.text,
        content: request.input.text,
        type: 'context',
        tags: request.scope.project ? [request.scope.project] : [],
      };
    case 'api_key_create':
      return { name: `Generated from ${request.user.source}`, type: 'restricted' };
    default:
      return { query: request.input.text };
  }
}
