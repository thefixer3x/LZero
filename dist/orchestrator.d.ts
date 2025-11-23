/**
 * VortexAI L0 Universal Work Orchestrator
 *
 * Programmatic API for workflow orchestration
 * @module orchestrator
 */
export interface L0Response {
    message: string;
    code?: string;
    data?: any;
    related?: string[];
    clipboard?: boolean;
    dashboardUrl?: string;
    type: 'snippet' | 'memory' | 'context' | 'help' | 'orchestration' | 'campaign';
    workflow?: string[];
    agents?: string[];
}
export interface L0QueryOptions {
    project?: string;
    format?: 'text' | 'json' | 'workflow';
    [key: string]: any;
}
/**
 * VortexAI L0 Universal Work Orchestrator
 *
 * Orchestrates workflows across social media, content creation, development, and more.
 *
 * @example
 * ```typescript
 * import { L0Orchestrator } from 'vortexai-l0/orchestrator';
 *
 * const orchestrator = new L0Orchestrator();
 * const response = await orchestrator.query('create viral TikTok campaign');
 * console.log(response.message);
 * ```
 */
export declare class L0Orchestrator {
    private mockDatabase;
    /**
     * Query the orchestrator with a natural language request
     *
     * @param query - Natural language query describing the workflow
     * @param options - Optional configuration for the query
     * @returns Promise resolving to an L0Response
     */
    query(query: string, options?: L0QueryOptions): Promise<L0Response>;
    /**
     * Orchestrate a social media campaign
     */
    orchestrateCampaign(request: string): Promise<L0Response>;
    /**
     * Orchestrate content creation workflow
     */
    orchestrateContent(request: string): Promise<L0Response>;
    /**
     * Analyze trending topics and hashtags
     */
    analyzeTrends(request: string): Promise<L0Response>;
    /**
     * Find code snippets matching a description
     */
    findCode(description: string): Promise<L0Response>;
    /**
     * Search memories and knowledge base
     */
    searchMemories(query: string): Promise<L0Response>;
    /**
     * Get help and guidance on a topic
     */
    getHelp(query: string): Promise<L0Response>;
    /**
     * General orchestration for unspecified requests
     */
    orchestrateGeneral(request: string): Promise<L0Response>;
}
export declare const orchestrator: L0Orchestrator;
//# sourceMappingURL=orchestrator.d.ts.map