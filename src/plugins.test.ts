import { describe, it, expect, beforeEach } from 'vitest';
import {
  PluginManager,
  L0Plugin,
  devToolsPlugin,
  analyticsPlugin,
  collaborationPlugin,
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
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
      };

      expect(manager.register(plugin)).toBe(true);
      expect(manager.has('test-plugin')).toBe(true);
      expect(manager.count).toBe(1);
    });

    it('should reject duplicate plugin names', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'dupe', version: '1.0.0', description: 'Test' },
        triggers: ['test'],
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
      };

      expect(manager.register(plugin)).toBe(true);
      expect(manager.register(plugin)).toBe(false);
      expect(manager.count).toBe(1);
    });

    it('should reject plugins with missing metadata', () => {
      const plugin = {
        metadata: { name: 'bad' },
        triggers: ['test'],
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
      } as unknown as L0Plugin;

      expect(manager.register(plugin)).toBe(false);
    });

    it('should reject plugins with empty triggers', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'bad', version: '1.0.0', description: 'Test' },
        triggers: [],
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
      };

      expect(manager.register(plugin)).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should remove a registered plugin', () => {
      const plugin: L0Plugin = {
        metadata: { name: 'removable', version: '1.0.0', description: 'Test' },
        triggers: ['remove'],
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
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
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
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
        handler: async () => ({ message: 'High', type: 'orchestration' }),
      });

      manager.register({
        metadata: { name: 'low-priority', version: '1.0.0', description: 'Low' },
        triggers: ['deploy'],
        priority: 1,
        handler: async () => ({ message: 'Low', type: 'orchestration' }),
      });
    });

    it('should find plugins matching query', () => {
      const matches = manager.findMatching('deploy my app');
      expect(matches.length).toBe(2);
    });

    it('should sort by priority', () => {
      const matches = manager.findMatching('deploy');
      expect(matches[0].metadata.name).toBe('high-priority');
    });

    it('should not return disabled plugins', () => {
      manager.setEnabled('high-priority', false);
      const matches = manager.findMatching('deploy');
      expect(matches.length).toBe(1);
      expect(matches[0].metadata.name).toBe('low-priority');
    });

    it('should return empty array for no matches', () => {
      const matches = manager.findMatching('unrelated query');
      expect(matches.length).toBe(0);
    });
  });

  describe('execute', () => {
    it('should execute matching plugin handler', async () => {
      manager.register({
        metadata: { name: 'executor', version: '1.0.0', description: 'Test' },
        triggers: ['execute'],
        handler: async (ctx) => ({
          message: `Executed: ${ctx.query}`,
          type: 'orchestration',
        }),
      });

      const result = await manager.execute('execute this task');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('execute this task');
    });

    it('should return null when no plugins match', async () => {
      const result = await manager.execute('no matching plugins');
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should list all enabled plugins', () => {
      manager.register({
        metadata: { name: 'plugin-a', version: '1.0.0', description: 'A' },
        triggers: ['a'],
        handler: async () => ({ message: 'A', type: 'orchestration' }),
      });

      manager.register({
        metadata: { name: 'plugin-b', version: '2.0.0', description: 'B' },
        triggers: ['b'],
        handler: async () => ({ message: 'B', type: 'orchestration' }),
      });

      const list = manager.list();
      expect(list.length).toBe(2);
      expect(list.map(p => p.name)).toContain('plugin-a');
      expect(list.map(p => p.name)).toContain('plugin-b');
    });
  });

  describe('toJSON', () => {
    it('should serialize plugin registry', () => {
      manager.register({
        metadata: { name: 'serializable', version: '1.0.0', description: 'Test' },
        triggers: ['serialize'],
        handler: async () => ({ message: 'Test', type: 'orchestration' }),
      });

      const json = manager.toJSON();
      const parsed = JSON.parse(json);

      expect(parsed.length).toBe(1);
      expect(parsed[0].name).toBe('serializable');
      expect(parsed[0].triggers).toContain('serialize');
    });
  });
});

describe('Built-in Plugins', () => {
  describe('devToolsPlugin', () => {
    it('should handle debug requests', async () => {
      const response = await devToolsPlugin.handler({ query: 'debug my application' });
      expect(response.type).toBe('orchestration');
      expect(response.message).toContain('Debug');
      expect(response.workflow).toBeDefined();
    });

    it('should handle test requests', async () => {
      const response = await devToolsPlugin.handler({ query: 'test my code' });
      expect(response.message).toContain('Testing');
    });

    it('should handle deploy requests', async () => {
      const response = await devToolsPlugin.handler({ query: 'deploy to production' });
      expect(response.message).toContain('Deploy');
    });
  });

  describe('analyticsPlugin', () => {
    it('should handle KPI requests', async () => {
      const response = await analyticsPlugin.handler({ query: 'analyze kpi metrics' });
      expect(response.type).toBe('orchestration');
      expect(response.message).toContain('KPI');
    });

    it('should handle general analytics requests', async () => {
      const response = await analyticsPlugin.handler({ query: 'create report' });
      expect(response.message).toContain('Analytics');
    });
  });

  describe('collaborationPlugin', () => {
    it('should handle standup requests', async () => {
      const response = await collaborationPlugin.handler({ query: 'run daily standup' });
      expect(response.message).toContain('Standup');
    });

    it('should handle retrospective requests', async () => {
      const response = await collaborationPlugin.handler({ query: 'sprint retrospective' });
      expect(response.message).toContain('Retrospective');
    });
  });
});

describe('createPluginManager', () => {
  it('should create manager with built-in plugins', () => {
    const manager = createPluginManager(true);
    expect(manager.count).toBe(3);
    expect(manager.has('dev-tools')).toBe(true);
    expect(manager.has('analytics')).toBe(true);
    expect(manager.has('collaboration')).toBe(true);
  });

  it('should create empty manager when builtins disabled', () => {
    const manager = createPluginManager(false);
    expect(manager.count).toBe(0);
  });
});
