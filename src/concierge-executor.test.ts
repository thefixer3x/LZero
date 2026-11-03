import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryConcierge } from './concierge.js';
import { executeConciergeRequest, conversationSessionId } from './concierge-executor.js';
import type { ConciergeRequest } from './concierge-contract.js';

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

function routerResponse(text: string, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => ({ response: text }),
  };
}

function memorySearchResponse(results: unknown[] = []) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: { results } }),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Memory concierge orchestration', () => {
  it('routes a concierge request through concierge.query', async () => {
    const concierge = new MemoryConcierge();

    const fetchMock = vi.fn().mockResolvedValue(
      routerResponse('Synthesized answer about OAuth from the router.')
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await concierge.query('what did we decide about oauth?', {
      conciergeRequest: {
        request: sampleRequest('what did we decide about oauth?'),
        memoryApiUrl: 'https://api.lanonasis.com',
        aiRouterUrl: 'https://ai.vortexcore.app',
      },
    });

    // Primary path calls the router, not MaaS directly.
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toBe('https://ai.vortexcore.app/api/v1/ai-chat');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(response.message).toContain('Synthesized answer');
    expect(response.type).toBe('memory');
  });

  it('sends the service key as X-API-Key for lano_* credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(routerResponse('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await executeConciergeRequest({
      request: sampleRequest('hello'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
      memoryAuthToken: 'lano_test123',
    });

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers['X-API-Key']).toBe('lano_test123');
    // Never send a lano_ key as Bearer.
    expect(headers['Authorization']).toBeUndefined();
  });

  it('sends a session_id so the router can keep the conversation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(routerResponse('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await executeConciergeRequest({
      request: sampleRequest('summarise those'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
      memoryAuthToken: 'user-concierge-token',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.session_id).toBe('slack:T123:C123:dm:U123');
    expect(body.use_case).toBe('memory-analysis');
    // The linked user's own token, as Bearer — the router forwards exactly this to memory.
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer user-concierge-token');
  });

  it('keys DMs per user (stable across messages) and channels per thread', () => {
    const dm1 = sampleRequest('a');
    const dm2 = { ...sampleRequest('b'), conversation: { ...sampleRequest('b').conversation, threadId: 'ts-2', messageId: 'ts-2' } };
    expect(conversationSessionId(dm1)).toBe(conversationSessionId(dm2));

    const thread = (ts: string) => ({
      ...sampleRequest('x'),
      conversation: { channelId: 'C9', threadId: ts, messageId: 'm', conversationId: 'T123:C9', isDirectMessage: false },
    });
    expect(conversationSessionId(thread('1700000000.0001'))).toBe('slack:T123:C9:1700000000.0001');
    expect(conversationSessionId(thread('1700000000.0001'))).not.toBe(conversationSessionId(thread('1700000000.0002')));
  });

  it('sanitises the session id to the router contract and omits it when ids are missing', () => {
    const odd = { ...sampleRequest('x'), user: { ...sampleRequest('x').user, externalUserId: 'U 1/é' } };
    expect(conversationSessionId(odd)).toMatch(/^[A-Za-z0-9._:-]{8,128}$/);
    const noChannel = { ...sampleRequest('x'), conversation: { ...sampleRequest('x').conversation, channelId: '' } };
    expect(conversationSessionId(noChannel)).toBeUndefined();
    const noDmUser = { ...sampleRequest('x'), user: { ...sampleRequest('x').user, externalUserId: '', internalUserId: '' } };
    expect(conversationSessionId(noDmUser)).toBeUndefined();
  });

  it('omits session_id from the router body when no session key derives', async () => {
    const fetchMock = vi.fn().mockResolvedValue(routerResponse('ok'));
    vi.stubGlobal('fetch', fetchMock);

    const noChannel = { ...sampleRequest('x'), conversation: { ...sampleRequest('x').conversation, channelId: '' } };
    await executeConciergeRequest({
      request: noChannel,
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
      memoryAuthToken: 'user-concierge-token',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('session_id');
  });

  it('falls back to the MaaS memory template when the router fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routerResponse('nope', false)) // router 500
      .mockResolvedValueOnce(
        memorySearchResponse([
          {
            id: 'm1',
            title: 'OAuth PKCE decision',
            content: 'We decided to use PKCE for public clients.',
            memory_type: 'project',
            similarity: 0.91,
          },
        ])
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeConciergeRequest({
      request: sampleRequest('what did we decide about oauth?'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
    });

    expect(result.type).toBe('answer');
    expect(result.message).toContain('OAuth PKCE decision');
    // Fallback path hit MaaS directly.
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.lanonasis.com/api/v1/memory/search');
  });

  it('returns an error response when both router and MaaS are unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const result = await executeConciergeRequest({
      request: sampleRequest('hello'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
    });

    expect(result.type).toBe('error');
    expect(result.message).toContain('could not reach MaaS');
  });

  it('reports no memories when the router returns empty and fallback search is empty', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routerResponse('')) // router empty response
      .mockResolvedValueOnce(memorySearchResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeConciergeRequest({
      request: sampleRequest('nothing here'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
    });

    expect(result.type).toBe('answer');
    expect(result.message).toContain('found nothing relevant');
  });

  it('never exposes the auth token in the user-visible message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routerResponse('nope', false))
      .mockResolvedValueOnce(
        memorySearchResponse([
          {
            id: 'm1',
            title: 'T',
            content: 'C',
            memory_type: 'project',
            similarity: 0.8,
          },
        ])
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeConciergeRequest({
      request: sampleRequest('hello'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
      memoryAuthToken: 'lano_supersecret',
    });

    expect(result.message).not.toContain('lano_supersecret');
    // Error path also never echoes the token.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const err2 = await executeConciergeRequest({
      request: sampleRequest('boom'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
      memoryAuthToken: 'lano_supersecret',
    });
    expect(err2.message).not.toContain('lano_supersecret');
  });

  it('pauses for approval on write-like productive actions', async () => {
    const result = await executeConciergeRequest({
      request: sampleRequest('create api key for integrations'),
      memoryApiUrl: 'https://api.lanonasis.com',
      aiRouterUrl: 'https://ai.vortexcore.app',
    });

    expect(result.type).toBe('approval_required');
    expect(result.message).toContain('requires your approval');
    expect(result.proposedAction).toMatchObject({ tool: 'api_key_create' });
  });
});
