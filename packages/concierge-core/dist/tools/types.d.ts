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
    toolOverrides: Record<string, {
        requiresApproval: boolean;
    }>;
}
export declare const DEFAULT_APPROVAL_POLICY: ApprovalPolicy;
export declare function classifyTool(name: string): ToolClass;
export declare function requiresApproval(tool: string, policy?: ApprovalPolicy): boolean;
//# sourceMappingURL=types.d.ts.map