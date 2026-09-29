import { describe, it, expect, beforeEach } from 'vitest';
import {
  PluginManager,
  L0Plugin,
  devWorkflowsPlugin,
  memoryInsightsPlugin,
  teamContextPlugin,
  createPluginManager,
} from './plugins.js';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('register', () => {
    it('should register a valid plugin', () => {
      const plugin: L0Plugin = {
        metadata: {
          name: 'test-plugin',
          version: '1.0.0',
          description: 'Test plugin',
        },
        triggers: ['test', 'example'],
        handler: async () => ({ message: 'Test', type: 'suggestion' }),
      };

      expect(manager.register(plugin)).toBe(true);
      expect(manager.has('test-plugin')).toBe(true);
      expect(manager.count).toBe(1);
    });

    it('should reject duplicate plugin names', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'dupe', version: '1.0.0', description: 'Test' },
        triggers: ['test'],
        handler: async () => ({ message: 'Test', type: 'suggestion' }),
      };

      expect(manager.register(plugin)).toBe(true);
      expect(manager.register(plugin)).toBe(false);
      expect(manager.count).toBe(1);
    });

    it('should reject plugins with missing metadata', () => {
      const plugin = {
        metadata: { name: 'bad' },
        triggers: ['test'],
        handler: async () => ({ message: 'Test', type: 'suggestion' }),
      } as unknown as L0Plugin;

      expect(manager.register(plugin)).toBe(false);
    });

    it('should reject plugins with empty triggers', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'bad', version: '1.0.0', description: 'Test' },
        triggers: [],
        handler: async () => ({ message: 'Test', type: 'suggestion' }),
      };

      expect(manager.register(plugin)).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should remove a registered plugin', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'removable', version: '1.0.0', description: 'Test' },
        triggers: ['remove'],
        handler: async () => ({ message: 'Test', type: 'suggestion' }),
      };

      manager.register(plugin);
      expect(manager.unregister('removable')).toBe(true);
      expect(manager.has('removable')).toBe(false);
    });

    it('should return false for non-existent plugin', () => {
      expect(manager.unregister('nonexistent')).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('should disable and enable plugins', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'toggleable', version: '1.0.0', description: 'Test' },
        triggers: ['toggle'],
        handler: async () => ({ message: 'Test', type: 'suggestion' }),
      };

      manager.register(plugin);
      expect(manager.enabledCount).toBe(1);

      manager.setEnabled('toggleable', false);
      expect(manager.enabledCount).toBe(0);

      manager.setEnabled('toggleable', true);
      expect(manager.enabledCount).toBe(1);
    });
  });

  describe('findMatching', () => {
    beforeEach(() => {
      manager.register({
        metadata: { name: 'high-priority', version: '1.0.0', description: 'High' },
        triggers: ['deploy'],
        priority: 100,
        handler: async () => ({ message: 'High', type: 'suggestion' }),
      });

      manager.register({
        metadata: { name: 'low-priority', version: '1.0.0', description: 'Low' },
        triggers: ['deploy', 'test'],
        priority: 1,
        handler: async () => ({ message: 'Low', type: 'suggestion' }),
      });
    });

    it('should match triggers and sort by priority', () => {
      const matches = manager.findMatching('deploy');
      expect(matches).toHaveLength(2);
      expect(matches[0].metadata.name).toBe('high-priority');
      expect(matches[1].metadata.name).toBe('low-priority');
    });

    it('should return empty array for no matches', () => {
      const matches = manager.findMatching('xyz');
      expect(matches).toHaveLength(0);
    });
  });

  describe('list', () => {
    it('should only return enabled plugins', () => {
      manager.register({
        metadata: { name: 'a', version: '1.0.0', description: 'A' },
        triggers: ['a'],
        handler: async () => ({ message: 'A', type: 'suggestion' }),
      });
      manager.register({
        metadata: { name: 'b', version: '1.0.0', description: 'B' },
        triggers: ['b'],
        handler: async () => ({ message: 'B', type: 'suggestion' }),
      });
      manager.setEnabled('b', false);
      const list = manager.list();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('a');
    });
  });

  describe('listDetailed', () => {
    it('should return metadata with enabled status and triggers', () => {
      manager.register({
        metadata: { name: 'detail-test', version: '2.0.0', description: 'D' },
        triggers: ['x', 'y'],
        handler: async () => ({ message: 'X', type: 'suggestion' }),
      });
      const details = manager.listDetailed();
      expect(details).toHaveLength(1);
      expect(details[0].metadata.name).toBe('detail-test');
      expect(details[0].enabled).toBe(true);
      expect(details[0].triggers).toEqual(['x', 'y']);
    });
  });

  describe('toJSON', () => {
    it('should serialize plugin registry', () => {
      manager.register({
        metadata: { name: 'json-test', version: '0.1.0', description: 'JSON' },
        triggers: ['j'],
        handler: async () => ({ message: 'J', type: 'suggestion' }),
      });
      const json = manager.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('json-test');
      expect(parsed[0].metadata.name).toBe('json-test');
    });
  });
});

describe('Built-in Plugins', () => {
  describe('devWorkflowsPlugin', () => {
    it('should handle debug requests', async () => {
      const response = await devWorkflowsPlugin.handler({ query: 'debug crash' });
      expect(response.type).toBe('suggestion');
      expect(response.workflow).toBeDefined();
    });

    it('should handle test requests', async () => {
      const response = await devWorkflowsPlugin.handler({ query: 'test coverage' });
      expect(response.type).toBe('suggestion');
    });

    it('should handle deploy requests', async () => {
      const response = await devWorkflowsPlugin.handler({ query: 'deploy to prod' });
      expect(response.type).toBe('suggestion');
    });
  });

  describe('memoryInsightsPlugin', () => {
    it('should handle kpi requests', async () => {
      const response = await memoryInsightsPlugin.handler({ query: 'kpi dashboard' });
      expect(response.type).toBe('suggestion');
      expect(response.data).toBeDefined();
    });

    it('should handle general metrics', async () => {
      const response = await memoryInsightsPlugin.handler({ query: 'metrics report' });
      expect(response.type).toBe('suggestion');
    });
  });

  describe('teamContextPlugin', () => {
    it('should handle standup requests', async () => {
      const response = await teamContextPlugin.handler({ query: 'run daily standup' });
      expect(response.type).toBe('suggestion');
      expect(response.data).toBeDefined();
    });

    it('should handle retrospective requests', async () => {
      const response = await teamContextPlugin.handler({ query: 'sprint retrospective' });
      expect(response.type).toBe('suggestion');
    });
  });
});

describe('createPluginManager', () => {
  it('should create manager with built-in plugins', () => {
    const manager = createPluginManager(true);
    expect(manager.count).toBe(3);
    expect(manager.has('dev-workflows')).toBe(true);
    expect(manager.has('memory-insights')).toBe(true);
    expect(manager.has('team-context')).toBe(true);
  });

  it('should create empty manager when builtins disabled', () => {
    const manager = createPluginManager(false);
    expect(manager.count).toBe(0);
  });
});
