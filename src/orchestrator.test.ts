import { describe, it, expect } from 'vitest';
import { L0Orchestrator, type L0Response } from './orchestrator.js';

describe('L0Orchestrator', () => {
  const orchestrator = new L0Orchestrator();

  describe('query', () => {
    it('should handle campaign requests', async () => {
      const response = await orchestrator.query('create viral TikTok campaign');
      expect(response.type).toBe('campaign');
      expect(response.workflow).toBeDefined();
      expect(response.agents).toBeDefined();
    });

    it('should handle content creation requests', async () => {
      const response = await orchestrator.query('create content strategy');
      expect(response.type).toBe('orchestration');
      expect(response.workflow).toBeDefined();
    });

    it('should handle trend analysis requests', async () => {
      const response = await orchestrator.query('analyze trending hashtags');
      expect(response.type).toBe('orchestration');
      expect(response.data).toBeDefined();
    });

    it('should handle code snippet requests', async () => {
      const response = await orchestrator.query('code floating card');
      expect(response.type).toBe('snippet');
    });

    it('should handle memory search requests', async () => {
      const response = await orchestrator.query('memory oauth');
      expect(response.type).toBe('memory');
    });

    it('should handle help requests', async () => {
      const response = await orchestrator.query('help social media');
      expect(response.type).toBe('help');
    });

    it('should handle general orchestration requests', async () => {
      const response = await orchestrator.query('do something');
      expect(response.type).toBe('orchestration');
      expect(response.workflow).toBeDefined();
    });
  });

  describe('orchestrateCampaign', () => {
    it('should return campaign response with workflow', async () => {
      const response = await orchestrator.orchestrateCampaign('viral product launch');
      expect(response.type).toBe('campaign');
      expect(response.workflow).toHaveLength(5);
      expect(response.agents).toHaveLength(4);
      expect(response.data).toBeDefined();
    });
  });

  describe('findCode', () => {
    it('should find matching code snippets', async () => {
      const response = await orchestrator.findCode('floating card');
      expect(response.type).toBe('snippet');
      expect(response.code).toBeDefined();
      expect(response.data).toBeDefined();
    });

    it('should return helpful message when no matches found', async () => {
      const response = await orchestrator.findCode('nonexistent component xyz123');
      expect(response.type).toBe('snippet');
      expect(response.code).toBeUndefined();
      expect(response.related).toBeDefined();
    });
  });

  describe('searchMemories', () => {
    it('should find matching memories', async () => {
      const response = await orchestrator.searchMemories('oauth');
      expect(response.type).toBe('memory');
      expect(response.data).toBeDefined();
    });

    it('should return helpful message when no matches found', async () => {
      const response = await orchestrator.searchMemories('nonexistent memory xyz123');
      expect(response.type).toBe('memory');
      expect(response.related).toBeDefined();
    });
  });

  describe('getHelp', () => {
    it('should return help for known topics', async () => {
      const response = await orchestrator.getHelp('social media');
      expect(response.type).toBe('help');
      expect(response.message).toContain('Social Media');
    });

    it('should return general help for unknown topics', async () => {
      const response = await orchestrator.getHelp('xyz123');
      expect(response.type).toBe('help');
      expect(response.related).toBeDefined();
    });
  });
});

