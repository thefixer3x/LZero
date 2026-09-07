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
}
