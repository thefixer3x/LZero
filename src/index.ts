// Browser-safe entrypoint: re-export programmatic APIs only
export { L0Orchestrator, orchestrator } from './orchestrator.js';
export { PluginManager, pluginManager, createPluginManager } from './plugins.js';

// Memory Services Plugin - lean integration with LanOnasis MaaS
export {
  memoryServicesPlugin,
  memoryAPI,
  configureMemoryPlugin,
  type MemoryPluginConfig,
} from './memory-plugin.js';

// Concierge execution for Slack / Discord / external surfaces
export {
  executeConciergeRequest,
  type ConciergeExecutionContext,
  type MemoryResult,
} from './concierge-executor.js';

export type { L0Response, L0QueryOptions, L0Plugin, PluginMetadata } from './types.js';