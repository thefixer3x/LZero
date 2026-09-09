export type ToolClass = 'read' | 'write' | 'execute' | 'agent';

export interface ClassifiedTool {
  name: string;
  class: ToolClass;
  description: string;
  requiresApproval: boolean;
}

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

export interface ApprovalRequest {
  id: string;
  status: 'pending' | 'approved' | 'edited' | 'cancelled';
  toolCall: ToolCallRequest;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  finalArguments?: Record<string, unknown>;
  result?: unknown;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'requested' | 'approved' | 'edited' | 'cancelled' | 'executed' | 'failed';
  approvalId: string;
  actorId: string;
  source: 'slack' | 'discord';
  tool: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
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
