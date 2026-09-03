export interface ConciergeRequest {
  requestId: string;
  user: {
    internalUserId: string;
    externalUserId: string;
    source: 'slack' | 'discord';
    workspaceId: string;
    organizationId?: string;
  };
  conversation: {
    channelId: string;
    threadId: string;
    messageId: string;
    conversationId: string;
    isDirectMessage: boolean;
  };
  scope: {
    project?: string;
    tenant?: string;
    channel?: string;
  };
  input: {
    text: string;
    attachments?: Array<{
      type: string;
      url?: string;
      text?: string;
    }>;
  };
  activeContext?: {
    entityType?: 'channel' | 'thread' | 'dm' | 'canvas' | 'list';
    entityId?: string;
  };
  permissions: {
    mayRead: boolean;
    mayWrite: boolean;
    requiresApprovalForMutations: boolean;
  };
  metadata: Record<string, unknown>;
}

export interface ConciergeResponse {
  message: string;
  type: 'answer' | 'plan' | 'approval_required' | 'error';
  data?: Record<string, unknown>;
  proposedAction?: unknown;
  approvalId?: string;
  sources?: string[];
  correlationId?: string;
  status?: 'complete' | 'pending_approval' | 'error';
}

export type ToolClass = 'read' | 'write' | 'execute' | 'agent';

export interface ToolCallRequest {
  id: string;
  tool: string;
  arguments: Record<string, unknown>;
  classification: ToolClass;
  requestedBy: {
    internalUserId: string;
    source: 'slack' | 'discord';
    workspaceId: string;
  };
  context: {
    project?: string;
    tenant?: string;
    conversationId: string;
    correlationId?: string;
  };
}

export interface ApprovalPolicy {
  defaultRequiresApproval: boolean;
  classesRequiringApproval: ToolClass[];
  toolOverrides: Record<string, { requiresApproval: boolean }>;
}

export const DEFAULT_APPROVAL_POLICY: ApprovalPolicy = {
  defaultRequiresApproval: true,
  classesRequiringApproval: ['write', 'execute', 'agent'],
  toolOverrides: {
    memory_search: { requiresApproval: false },
    memory_list: { requiresApproval: false },
    get_status: { requiresApproval: false },
  },
};

export function classifyTool(name: string): ToolClass {
  const lower = name.toLowerCase();
  if (lower.includes('delete') || lower.includes('remove') || lower.includes('rotate') || lower.includes('create')) {
    return 'write';
  }
  if (lower.includes('execute') || lower.includes('run') || lower.includes('deploy')) {
    return 'execute';
  }
  if (lower.includes('agent') || lower.includes('orchestrate')) {
    return 'agent';
  }
  return 'read';
}

export function requiresApproval(tool: string, policy: ApprovalPolicy = DEFAULT_APPROVAL_POLICY): boolean {
  if (policy.toolOverrides[tool]) {
    return policy.toolOverrides[tool].requiresApproval;
  }

  const toolClass = classifyTool(tool);
  return policy.classesRequiringApproval.includes(toolClass);
}
