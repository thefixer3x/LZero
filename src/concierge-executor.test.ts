import { describe, it, expect, vi, afterEach } from 'vitest';
import { L0Orchestrator } from './orchestrator.js';
import { executeConciergeRequest } from './concierge-executor.js';
import type { ConciergeRequest } from '@lanonasis/concierge-core';

function sampleRequest(text: string): ConciergeRequest {
  return {
    requestId: 'req-1',
    user: {
      internalUserId: 'user-1',
      externalUserId: 'U123',
      source: 'slack',
      workspaceId: 'T123',
    },
    conversation: {
      channelId: 'C123',
      threadId: 'ts-1',
      messageId: 'ts-1',
      conversationId: 'T123:C123',
      isDirectMessage: true,
    },
    scope: { project: 'lanonasis-maas', tenant: 'T123' },
    input: { text },
    permissions: { mayRead: true, mayWrite: false, requiresApprovalForMutations: true },
    metadata: {},
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('L0 concierge orchestration', () => {
  it('routes a concierge request through orchestrator.query', async () => {
    const l0 = new L0Orchestrator();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          results: [
            {
              id: 'm1',
              title: 'OAuth PKCE decision',
              content: 'We decided to use PKCE for public clients.',
              memory_type: 'project',
              similarity: 0.91,
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await l0.query('what did we decide about oauth?', {
      conciergeRequest: {
        request: sampleRequest('what did we decide about oauth?'),
        memoryApiUrl: 'https://api.lanonasis.com',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.lanonasis.com/api/v1/memory/search',
      expect.objectContaining({ method: 'POST' })
    );
    expect(response.message).toContain('OAuth PKCE decision');
    expect(response.type).toBe('memory');
  });

  it('returns an error response when MaaS is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const result = await executeConciergeRequest({
      request: sampleRequest('hello'),
      memoryApiUrl: 'https://api.lanonasis.com',
    });

    expect(result.type).toBe('error');
    expect(result.message).toContain('could not reach MaaS');
  });

  it('reports no memories when the search returns empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: { results: [] } }),
      })
    );

    const result = await executeConciergeRequest({
      request: sampleRequest('nothing here'),
      memoryApiUrl: 'https://api.lanonasis.com',
    });

    expect(result.type).toBe('answer');
    expect(result.message).toContain('found nothing relevant');
  });

  it('pauses for approval on write-like productive actions', async () => {
    const result = await executeConciergeRequest({
      request: sampleRequest('create api key for integrations'),
      memoryApiUrl: 'https://api.lanonasis.com',
    });

    expect(result.type).toBe('approval_required');
    expect(result.message).toContain('requires your approval');
    expect(result.proposedAction).toMatchObject({ tool: 'api_key_create' });
  });
});
