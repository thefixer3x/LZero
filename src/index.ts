// Memory Concierge — barrel re-export
export { MemoryConcierge, memoryConcierge, type MemoryResponse, type MemoryQueryOptions, type MemoryResponseType, type OutputFormat } from './concierge.js';
export { PluginManager, pluginManager, createPluginManager, type L0Plugin, type PluginMetadata } from './plugins.js';

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
