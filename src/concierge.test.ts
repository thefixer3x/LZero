import { describe, it, expect } from 'vitest';
import { MemoryConcierge, type MemoryResponse } from './concierge.js';

describe('MemoryConcierge', () => {
  const concierge = new MemoryConcierge();

  describe('query', () => {
    it('should create a memory on "remember" requests', async () => {
      const response = await concierge.query('remember that auth uses PKCE');
      expect(response.type).toBe('memory');
    });

    it('should search memories on "search/find" requests', async () => {
      const response = await concierge.query('find oauth patterns');
      expect(response.type).toBe('memory');
    });

    it('should recall patterns on "recall/pattern" requests', async () => {
      const response = await concierge.query('recall deployment patterns');
      expect(response.type).toBe('recall');
    });

    it('should find code snippets on "code/snippet" requests', async () => {
      const response = await concierge.query('code auth hook');
      expect(response.type).toBe('snippet');
    });

    it('should handle help requests', async () => {
      const response = await concierge.query('help memory');
      expect(response.type).toBe('help');
    });

    it('should handle general recall for unknown queries', async () => {
      const response = await concierge.query('do something');
      expect(response.type).toBe('context');
    });
  });

  describe('search', () => {
    it('should find matching memories', async () => {
      const response = await concierge.search('oauth');
      expect(response.type).toBe('memory');
      expect(response.data).toBeDefined();
    });

    it('should return no-match when nothing is found', async () => {
      const response = await concierge.search('nonexistent xyz123');
      expect(response.type).toBe('memory');
      expect(response.related).toBeDefined();
    });
  });

  describe('recall', () => {
    it('should find pattern entries', async () => {
      const response = await concierge.recall('deployment');
      expect(response.type).toBe('recall');
    });

    it('should return no-match for no pattern data', async () => {
      const response = await concierge.recall('nonexistent pattern xyz');
      expect(response.type).toBe('recall');
    });
  });

  describe('findSnippet', () => {
    it('should find matching snippets', async () => {
      const response = await concierge.findSnippet('auth hook');
      expect(response.type).toBe('snippet');
      expect(response.code).toBeDefined();
    });

    it('should return helpful message when no matches found', async () => {
      const response = await concierge.findSnippet('nonexistent component xyz123');
      expect(response.type).toBe('snippet');
    });
  });

  describe('getHelp', () => {
    it('should return help for known topics', async () => {
      const response = await concierge.getHelp('memory');
      expect(response.type).toBe('help');
      expect(response.message).toContain('Memory');
    });
  });
});
