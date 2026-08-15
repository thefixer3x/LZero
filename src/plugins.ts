/**
 * VortexAI L0 Plugin System
 *
 * Extensible plugin architecture for custom agents and workflows
 * @module plugins
 */

import { L0Response, L0ResponseType, PluginMetadata, PluginContext, PluginResult, PluginHandler, L0Plugin } from './types.js';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PluginRegistration {
  plugin: L0Plugin;
  enabled: boolean;
  registeredAt: Date;
}

// ============================================================================
// Plugin Manager Class
// ============================================================================

/**
 * Manages L0 plugins for extensible workflow orchestration
 *
 * @example
 * ```typescript
 * import { PluginManager } from 'vortexai-l0/plugins';
 *
 * const manager = new PluginManager();
 * manager.register({
 *   metadata: { name: 'my-plugin', version: '1.0.0', description: 'Custom workflow' },
 *   triggers: ['custom', 'my-workflow'],
 *   handler: async (ctx) => ({ message: 'Custom response', type: 'orchestration' })
 * });
 * ```
 */
export class PluginManager {
  private plugins: Map<string, PluginRegistration> = new Map();

  // ==========================================================================
  // Plugin Registration
  // ==========================================================================

  /**
   * Register a new plugin
   *
   * @param plugin - Plugin to register
   * @returns boolean indicating success
   */
  register(plugin: L0Plugin): boolean {
    const { name } = plugin.metadata;

    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered. Use update() to modify.`);
      return false;
    }

    if (!this.validatePlugin(plugin)) {
      return false;
    }

    this.plugins.set(name, {
      plugin,
      enabled: true,
      registeredAt: new Date(),
    });

    return true;
  }

  /**
   * Unregister a plugin by name
   *
   * @param name - Plugin name to remove
   * @returns boolean indicating success
   */
  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Enable or disable a plugin
   *
   * @param name - Plugin name
   * @param enabled - Enable state
   */
  setEnabled(name: string, enabled: boolean): boolean {
    const registration = this.plugins.get(name);
    if (!registration) return false;

    registration.enabled = enabled;
    return true;
  }

  // ==========================================================================
  // Plugin Discovery & Execution
  // ==========================================================================

  /**
   * Find plugins that match a query
   *
   * @param query - User query to match against plugin triggers
   * @returns Array of matching plugins sorted by priority
   */
  findMatching(query: string): L0Plugin[] {
    const lowerQuery = query.toLowerCase();
    const matches: { plugin: L0Plugin; score: number }[] = [];

    for (const [, registration] of this.plugins) {
      if (!registration.enabled) continue;

      const { plugin } = registration;
      let score = 0;

      for (const trigger of plugin.triggers) {
        if (lowerQuery.includes(trigger.toLowerCase())) {
          score += trigger.length;
        }
      }

      if (score > 0) {
        matches.push({ plugin, score: score + (plugin.priority || 0) });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .map(m => m.plugin);
  }

  /**
   * Execute the best matching plugin for a query
   *
   * @param query - User query
   * @param options - Execution options
   * @returns Plugin response or null if no match
   */
  async execute(query: string, options?: Record<string, unknown>): Promise<L0Response | null> {
    const matches = this.findMatching(query);

    if (matches.length === 0) {
      return null;
    }

    const context: PluginContext = { query, options };
    return matches[0].handler(context);
  }

  // ==========================================================================
  // Plugin Introspection
  // ==========================================================================

  /**
   * List all registered plugins
   */
  list(): PluginMetadata[] {
    return Array.from(this.plugins.values())
      .filter(r => r.enabled)
      .map(r => r.plugin.metadata);
  }

  /**
   * Get detailed info about all plugins
   */
  listDetailed(): Array<PluginMetadata & { enabled: boolean; triggers: string[] }> {
    return Array.from(this.plugins.values()).map(r => ({
      ...r.plugin.metadata,
      enabled: r.enabled,
      triggers: r.plugin.triggers,
    }));
  }

  /**
   * Get plugin count
   */
  get count(): number {
    return this.plugins.size;
  }

  /**
   * Get enabled plugin count
   */
  get enabledCount(): number {
    return Array.from(this.plugins.values()).filter(r => r.enabled).length;
  }

  /**
   * Check if a plugin exists
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get a specific plugin
   */
  get(name: string): L0Plugin | undefined {
    return this.plugins.get(name)?.plugin;
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  private validatePlugin(plugin: L0Plugin): boolean {
    const { metadata, triggers, handler } = plugin;

    if (!metadata?.name || !metadata?.version || !metadata?.description) {
      console.error('Plugin validation failed: metadata must include name, version, and description');
      return false;
    }

    if (!Array.isArray(triggers) || triggers.length === 0) {
      console.error('Plugin validation failed: triggers must be a non-empty array');
      return false;
    }

    if (typeof handler !== 'function') {
      console.error('Plugin validation failed: handler must be a function');
      return false;
    }

    return true;
  }

  // ==========================================================================
  // Serialization
  // ==========================================================================

  /**
   * Export plugin registry as JSON (metadata only)
   */
  toJSON(): string {
    const data = Array.from(this.plugins.entries()).map(([name, reg]) => ({
      name,
      metadata: reg.plugin.metadata,
      triggers: reg.plugin.triggers,
      enabled: reg.enabled,
      registeredAt: reg.registeredAt.toISOString(),
    }));

    return JSON.stringify(data, null, 2);
  }
}

// ============================================================================
// Built-in Plugins
// ============================================================================

/**
 * Development Tools Plugin
 * Provides dev-focused orchestration workflows
 */
export const devToolsPlugin: L0Plugin = {
  metadata: {
    name: 'dev-tools',
    version: '1.0.0',
    description: 'Development workflow orchestration tools',
    author: 'VortexAI',
    keywords: ['development', 'debugging', 'testing', 'ci/cd'],
  },
  triggers: ['debug', 'test', 'deploy', 'ci', 'cd', 'build', 'lint', 'refactor'],
  priority: 10,
  handler: async (ctx: PluginContext): Promise<L0Response> => {
    const lowerQuery = ctx.query.toLowerCase();

    if (lowerQuery.includes('debug')) {
      return {
        message: '🔧 Development Debugging Workflow',
        type: 'orchestration',
        workflow: [
          '📋 Reproduce the issue with minimal test case',
          '🔍 Analyze stack traces and error logs',
          '🎯 Identify root cause vs symptoms',
          '🛠️  Implement targeted fix',
          '✅ Verify fix with regression tests',
        ],
        agents: [
          'Debug Agent: Analyzing error patterns and stack traces',
          'Test Agent: Creating reproduction cases',
          'Code Agent: Implementing fixes',
        ],
        data: {
          recommendedTools: ['console.log', 'debugger', 'breakpoints', 'profiler'],
          bestPractices: ['Isolate the problem', 'Check recent changes', 'Review dependencies'],
        },
      };
    }

    if (lowerQuery.includes('test')) {
      return {
        message: '🧪 Testing Strategy Workflow',
        type: 'orchestration',
        workflow: [
          '📊 Analyze code coverage gaps',
          '🎯 Identify critical paths for testing',
          '✍️  Write unit tests for core logic',
          '🔗 Add integration tests for workflows',
          '🚀 Set up CI/CD test automation',
        ],
        agents: [
          'Test Agent: Generating test cases',
          'Coverage Agent: Analyzing test coverage',
          'CI Agent: Configuring automated testing',
        ],
      };
    }

    if (lowerQuery.includes('deploy') || lowerQuery.includes('ci') || lowerQuery.includes('cd')) {
      return {
        message: '🚀 Deployment Pipeline Workflow',
        type: 'orchestration',
        workflow: [
          '📋 Review deployment checklist',
          '🧪 Run pre-deployment tests',
          '🔒 Security scan and vulnerability check',
          '📦 Build and package artifacts',
          '🚀 Deploy to target environment',
          '✅ Post-deployment verification',
        ],
        agents: [
          'Build Agent: Compiling and packaging',
          'Security Agent: Running vulnerability scans',
          'Deploy Agent: Orchestrating deployment',
          'Monitor Agent: Verifying health checks',
        ],
      };
    }

    return {
      message: '🛠️  Development Workflow Orchestration',
      type: 'orchestration',
      workflow: [
        '🔍 Analyze development request',
        '📋 Create task breakdown',
        '⚡ Execute development tasks',
        '✅ Validate and test changes',
      ],
      agents: ['Dev Agent: Coordinating development tasks'],
    };
  },
};

/**
 * Analytics Plugin
 * Provides data analysis and reporting workflows
 */
export const analyticsPlugin: L0Plugin = {
  metadata: {
    name: 'analytics',
    version: '1.0.0',
    description: 'Data analytics and reporting workflows',
    author: 'VortexAI',
    keywords: ['analytics', 'data', 'reports', 'metrics', 'kpi'],
  },
  triggers: ['report', 'analytics', 'metrics', 'kpi', 'dashboard', 'insights', 'performance report'],
  priority: 10,
  handler: async (ctx: PluginContext): Promise<L0Response> => {
    const lowerQuery = ctx.query.toLowerCase();

    if (lowerQuery.includes('kpi') || lowerQuery.includes('metrics')) {
      return {
        message: '📊 KPI & Metrics Analysis Workflow',
        type: 'orchestration',
        workflow: [
          '📈 Define key performance indicators',
          '📊 Collect data from relevant sources',
          '🧮 Calculate metrics and benchmarks',
          '📉 Identify trends and anomalies',
          '📝 Generate actionable insights',
        ],
        agents: [
          'Data Agent: Aggregating metrics data',
          'Analysis Agent: Processing and calculating KPIs',
          'Insights Agent: Generating recommendations',
        ],
        data: {
          sampleKPIs: ['Conversion Rate', 'Engagement Rate', 'Customer Acquisition Cost', 'Lifetime Value'],
          reportTypes: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
        },
      };
    }

    return {
      message: '📈 Analytics & Reporting Workflow',
      type: 'orchestration',
      workflow: [
        '🔍 Define report objectives and scope',
        '📊 Gather and validate data sources',
        '📈 Analyze trends and patterns',
        '📝 Create visualizations and summaries',
        '🎯 Derive actionable recommendations',
      ],
      agents: [
        'Data Agent: Collecting and cleaning data',
        'Analytics Agent: Running statistical analysis',
        'Report Agent: Creating visualizations and reports',
      ],
    };
  },
};

/**
 * Team Collaboration Plugin
 * Provides team coordination workflows
 */
export const collaborationPlugin: L0Plugin = {
  metadata: {
    name: 'collaboration',
    version: '1.0.0',
    description: 'Team collaboration and coordination workflows',
    author: 'VortexAI',
    keywords: ['team', 'collaboration', 'meeting', 'standup', 'review'],
  },
  triggers: ['meeting', 'standup', 'review', 'sprint', 'retrospective', 'planning', 'team', 'collaborate'],
  priority: 5,
  handler: async (ctx: PluginContext): Promise<L0Response> => {
    const lowerQuery = ctx.query.toLowerCase();

    if (lowerQuery.includes('standup') || lowerQuery.includes('daily')) {
      return {
        message: '🤝 Daily Standup Facilitation',
        type: 'orchestration',
        workflow: [
          '📋 Gather team availability and blockers',
          '✅ Review yesterday\'s completed tasks',
          '🎯 Outline today\'s priorities',
          '🚧 Identify and escalate blockers',
          '📝 Document action items',
        ],
        agents: [
          'Coordination Agent: Facilitating standup flow',
          'Tracking Agent: Recording updates and blockers',
        ],
        data: {
          format: '15-minute timeboxed meeting',
          structure: ['What did you accomplish?', 'What will you work on?', 'Any blockers?'],
        },
      };
    }

    if (lowerQuery.includes('retrospective') || lowerQuery.includes('retro')) {
      return {
        message: '🔄 Sprint Retrospective Workflow',
        type: 'orchestration',
        workflow: [
          '✅ What went well this sprint?',
          '❌ What didn\'t go well?',
          '💡 What can we improve?',
          '🎯 Define action items',
          '📝 Document and track improvements',
        ],
        agents: [
          'Facilitation Agent: Guiding retrospective discussion',
          'Analysis Agent: Identifying patterns and themes',
          'Action Agent: Creating improvement tasks',
        ],
      };
    }

    return {
      message: '🤝 Team Collaboration Workflow',
      type: 'orchestration',
      workflow: [
        '📋 Define collaboration objectives',
        '👥 Coordinate team members',
        '📝 Document decisions and action items',
        '✅ Follow up on commitments',
      ],
      agents: ['Collaboration Agent: Coordinating team activities'],
    };
  },
};

// ============================================================================
// Singleton Instance & Factory
// ============================================================================

export interface PluginManagerOptions {
  includeBuiltins?: boolean;
  includeMemoryServices?: boolean;
}

/**
 * Create a new plugin manager with built-in plugins
 *
 * @param options - Configuration options
 * @param options.includeBuiltins - Include dev, analytics, collaboration plugins (default: true)
 * @param options.includeMemoryServices - Include LanOnasis memory services plugin (default: false)
 */
export function createPluginManager(options: PluginManagerOptions | boolean = true): PluginManager {
  const manager = new PluginManager();

  // Handle legacy boolean parameter
  const opts: PluginManagerOptions =
    typeof options === 'boolean' ? { includeBuiltins: options } : options;

  if (opts.includeBuiltins !== false) {
    manager.register(devToolsPlugin);
    manager.register(analyticsPlugin);
    manager.register(collaborationPlugin);
  }

  // Memory services plugin is opt-in (requires API config)
  if (opts.includeMemoryServices) {
    // Dynamically import to avoid bundling when not needed
    import('./memory-plugin.js').then(({ memoryServicesPlugin }) => {
      manager.register(memoryServicesPlugin);
    }).catch(() => {
      // Memory plugin not available - that's ok
    });
  }

  return manager;
}

export const pluginManager = createPluginManager();
