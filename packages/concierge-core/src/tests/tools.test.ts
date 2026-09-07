import { describe, it, expect, vi, afterEach } from 'vitest';
import { classifyTool, requiresApproval } from '../tools/types.js';
import { ApprovalEngine, createInMemoryApprovalStore } from '../tools/approval-engine.js';
import type { ToolCallRequest } from '../tools/types.js';

function sampleToolCall(tool: string): ToolCallRequest {
  return {
    id: `tc-${tool}`,
    tool,
    arguments: { query: 'test' },
    classification: 'write',
    requestedBy: {
      internalUserId: 'user-1',
      source: 'slack',
      workspaceId: 'T123',
    },
    context: {
      project: 'demo',
      tenant: 'T123',
      conversationId: 'T123:C123',
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tool classification', () => {
  it('classifies reads', () => {
    expect(classifyTool('memory_search')).toBe('read');
    expect(classifyTool('get_status')).toBe('read');
  });

  it('classifies writes', () => {
    expect(classifyTool('memory_create')).toBe('write');
    expect(classifyTool('api_key_delete')).toBe('write');
  });

  it('classifies executes', () => {
    expect(classifyTool('deploy_service')).toBe('execute');
  });

  it('uses policy overrides', () => {
    expect(requiresApproval('memory_search')).toBe(false);
    expect(requiresApproval('memory_create')).toBe(true);
  });
});

describe('approval engine', () => {
  it('allows read tools to execute directly', async () => {
    const engine = new ApprovalEngine({ store: createInMemoryApprovalStore() });
    const decision = await engine.evaluate(sampleToolCall('memory_search'));
    expect(decision.mode).toBe('execute');
  });

  it('requires approval for write tools', async () => {
    const engine = new ApprovalEngine({ store: createInMemoryApprovalStore() });
    const decision = await engine.evaluate(sampleToolCall('memory_create'));
    expect(decision.mode).toBe('approval_required');
    if (decision.mode === 'approval_required') {
      expect(decision.approval.status).toBe('pending');
    }
  });

  it('approves a pending request', async () => {
    const engine = new ApprovalEngine({ store: createInMemoryApprovalStore() });
    const decision = await engine.evaluate(sampleToolCall('memory_create'));
    expect(decision.mode).toBe('approval_required');
    const approvalId = decision.mode === 'approval_required' ? decision.approval.id : '';
    const updated = await engine.approve(approvalId, 'admin-1');
    expect(updated?.status).toBe('approved');
    expect(updated?.approvedBy).toBe('admin-1');
  });

  it('records audit on approve and cancel', async () => {
    const audits: unknown[] = [];
    const engine = new ApprovalEngine({
      store: createInMemoryApprovalStore(),
      auditSink: (entry) => { audits.push(entry); },
    });

    const decision = await engine.evaluate(sampleToolCall('memory_create'));
    const approvalId = decision.mode === 'approval_required' ? decision.approval.id : '';
    await engine.cancel(approvalId, 'user-1');

    expect(audits.length).toBeGreaterThanOrEqual(2);
    expect(audits.some((a: any) => a.action === 'requested')).toBe(true);
    expect(audits.some((a: any) => a.action === 'cancelled')).toBe(true);
  });
});
