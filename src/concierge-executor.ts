import type { ConciergeRequest, ConciergeResponse } from '@lanonasis/concierge-core';
import { classifyTool, requiresApproval, type ToolCallRequest } from '@lanonasis/concierge-core';

/**
 * L0ConciergeExecutor is the bridge between chat-platform adapters and VortexAI-L0.
 *
 * It accepts a platform-agnostic ConciergeRequest, assembles context
 * (memory search, active project, user permissions), and returns a ConciergeResponse.
 *
 * This implementation is intentionally thin: it delegates memory search to the
 * MaaS-backed memory plugin and leaves LLM / agent orchestration to L0.
 */

export interface ConciergeExecutionContext {
  request: ConciergeRequest;
  memoryApiUrl: string;
  memoryAuthToken?: string;
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

export async function executeConciergeRequest(
  ctx: ConciergeExecutionContext
): Promise<ConciergeResponse> {
  const { request } = ctx;

  // Naive intent detection: if the request looks like a command to mutate state,
  // treat it as a productive action that may require approval.
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
