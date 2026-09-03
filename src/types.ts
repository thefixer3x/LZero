import type { ConciergeRequest, ConciergeResponse } from './concierge-contract.js';

export type L0ResponseType = 'snippet' | 'memory' | 'context' | 'help' | 'orchestration' | 'campaign';
export type OutputFormat = 'text' | 'json' | 'workflow';

export interface L0Response {
  message: string;
  type: L0ResponseType;
  code?: string;
  data?: Record<string, unknown> | string;
  related?: string[];
  clipboard?: boolean;
  dashboardUrl?: string;
  workflow?: string[];
  agents?: string[];
}

export interface L0QueryOptions {
  project?: string;
  format?: OutputFormat;
  [key: string]: unknown;
}

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  keywords?: string[];
}

export interface PluginContext {
  query: string;
  options?: Record<string, unknown>;
}

export interface PluginResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export type PluginHandler = (context: PluginContext) => Promise<L0Response>;

export interface L0Plugin {
  metadata: PluginMetadata;
  triggers: string[];
  handler: PluginHandler;
  priority?: number;
}
