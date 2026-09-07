import { ApprovalRequest, ApprovalPolicy, ToolCallRequest, AuditEntry, DEFAULT_APPROVAL_POLICY, requiresApproval } from './types.js';

export interface ApprovalStore {
  create(request: ApprovalRequest): Promise<ApprovalRequest>;
  get(id: string): Promise<ApprovalRequest | undefined>;
  update(id: string, patch: Partial<ApprovalRequest>): Promise<ApprovalRequest | undefined>;
  listPending(): Promise<ApprovalRequest[]>;
}

export function createInMemoryApprovalStore(): ApprovalStore {
  const approvals = new Map<string, ApprovalRequest>();

  return {
    async create(request) {
      approvals.set(request.id, request);
      return request;
    },
    async get(id) {
      return approvals.get(id);
    },
    async update(id, patch) {
      const existing = approvals.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      approvals.set(id, updated);
      return updated;
    },
    async listPending() {
      return Array.from(approvals.values()).filter((a) => a.status === 'pending');
    },
  };
}

export interface ApprovalEngineConfig {
  store: ApprovalStore;
  policy?: ApprovalPolicy;
  auditSink?: (entry: AuditEntry) => Promise<void> | void;
}

export class ApprovalEngine {
  private store: ApprovalStore;
  private policy: ApprovalPolicy;
  private auditSink?: ApprovalEngineConfig['auditSink'];

  constructor(config: ApprovalEngineConfig) {
    this.store = config.store;
    this.policy = config.policy ?? DEFAULT_APPROVAL_POLICY;
    this.auditSink = config.auditSink;
  }

  async evaluate(toolCall: ToolCallRequest): Promise<
    | { mode: 'execute'; toolCall: ToolCallRequest }
    | { mode: 'approval_required'; approval: ApprovalRequest }
  > {
    if (!requiresApproval(toolCall.tool, this.policy)) {
      return { mode: 'execute', toolCall };
    }

    const approval: ApprovalRequest = {
      id: `apr-${toolCall.id}`,
      status: 'pending',
      toolCall,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.store.create(approval);
    await this.audit({
      id: `aud-${toolCall.id}-requested`,
      timestamp: new Date().toISOString(),
      action: 'requested',
      approvalId: approval.id,
      actorId: toolCall.requestedBy.internalUserId,
      source: toolCall.requestedBy.source,
      tool: toolCall.tool,
      arguments: toolCall.arguments,
    });

    return { mode: 'approval_required', approval };
  }

  async approve(approvalId: string, actorId: string): Promise<ApprovalRequest | undefined> {
    const approval = await this.store.update(approvalId, {
      status: 'approved',
      approvedBy: actorId,
      approvedAt: new Date().toISOString(),
      finalArguments: (await this.store.get(approvalId))?.toolCall.arguments,
    });

    if (approval) {
      await this.audit({
        id: `aud-${approval.id}-approved`,
        timestamp: new Date().toISOString(),
        action: 'approved',
        approvalId: approval.id,
        actorId,
        source: approval.toolCall.requestedBy.source,
        tool: approval.toolCall.tool,
        arguments: approval.finalArguments ?? approval.toolCall.arguments,
      });
    }

    return approval;
  }

  async edit(approvalId: string, actorId: string, finalArguments: Record<string, unknown>): Promise<ApprovalRequest | undefined> {
    const approval = await this.store.update(approvalId, {
      status: 'edited',
      approvedBy: actorId,
      approvedAt: new Date().toISOString(),
      finalArguments,
    });

    if (approval) {
      await this.audit({
        id: `aud-${approval.id}-edited`,
        timestamp: new Date().toISOString(),
        action: 'edited',
        approvalId: approval.id,
        actorId,
        source: approval.toolCall.requestedBy.source,
        tool: approval.toolCall.tool,
        arguments: finalArguments,
      });
    }

    return approval;
  }

  async cancel(approvalId: string, actorId: string): Promise<ApprovalRequest | undefined> {
    const approval = await this.store.update(approvalId, { status: 'cancelled' });

    if (approval) {
      await this.audit({
        id: `aud-${approval.id}-cancelled`,
        timestamp: new Date().toISOString(),
        action: 'cancelled',
        approvalId: approval.id,
        actorId,
        source: approval.toolCall.requestedBy.source,
        tool: approval.toolCall.tool,
        arguments: approval.toolCall.arguments,
      });
    }

    return approval;
  }

  async recordExecution(approval: ApprovalRequest, result: unknown): Promise<void> {
    await this.audit({
      id: `aud-${approval.id}-executed`,
      timestamp: new Date().toISOString(),
      action: 'executed',
      approvalId: approval.id,
      actorId: approval.approvedBy ?? approval.toolCall.requestedBy.internalUserId,
      source: approval.toolCall.requestedBy.source,
      tool: approval.toolCall.tool,
      arguments: approval.finalArguments ?? approval.toolCall.arguments,
      result,
    });
  }

  async recordFailure(approval: ApprovalRequest, error: Error): Promise<void> {
    await this.audit({
      id: `aud-${approval.id}-failed`,
      timestamp: new Date().toISOString(),
      action: 'failed',
      approvalId: approval.id,
      actorId: approval.approvedBy ?? approval.toolCall.requestedBy.internalUserId,
      source: approval.toolCall.requestedBy.source,
      tool: approval.toolCall.tool,
      arguments: approval.finalArguments ?? approval.toolCall.arguments,
      error: error.message,
    });
  }

  private async audit(entry: AuditEntry): Promise<void> {
    if (!this.auditSink) return;
    try {
      await this.auditSink(entry);
    } catch (err) {
      console.error('[approval-engine] audit sink failed', err);
    }
  }
}
