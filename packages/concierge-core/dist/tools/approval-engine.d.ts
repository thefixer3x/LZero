import { ApprovalRequest, ApprovalPolicy, ToolCallRequest, AuditEntry } from './types.js';
export interface ApprovalStore {
    create(request: ApprovalRequest): Promise<ApprovalRequest>;
    get(id: string): Promise<ApprovalRequest | undefined>;
    update(id: string, patch: Partial<ApprovalRequest>): Promise<ApprovalRequest | undefined>;
    listPending(): Promise<ApprovalRequest[]>;
}
export declare function createInMemoryApprovalStore(): ApprovalStore;
export interface ApprovalEngineConfig {
    store: ApprovalStore;
    policy?: ApprovalPolicy;
    auditSink?: (entry: AuditEntry) => Promise<void> | void;
}
export declare class ApprovalEngine {
    private store;
    private policy;
    private auditSink?;
    constructor(config: ApprovalEngineConfig);
    evaluate(toolCall: ToolCallRequest): Promise<{
        mode: 'execute';
        toolCall: ToolCallRequest;
    } | {
        mode: 'approval_required';
        approval: ApprovalRequest;
    }>;
    approve(approvalId: string, actorId: string): Promise<ApprovalRequest | undefined>;
    edit(approvalId: string, actorId: string, finalArguments: Record<string, unknown>): Promise<ApprovalRequest | undefined>;
    cancel(approvalId: string, actorId: string): Promise<ApprovalRequest | undefined>;
    recordExecution(approval: ApprovalRequest, result: unknown): Promise<void>;
    recordFailure(approval: ApprovalRequest, error: Error): Promise<void>;
    private audit;
}
//# sourceMappingURL=approval-engine.d.ts.map