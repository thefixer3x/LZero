import { agent, tool } from '@21st-sdk/agent';
import { z } from 'zod';

import type { L0Orchestrator as L0OrchestratorType, L0Response } from 'vortexai-l0/orchestrator';

let orchestratorPromise: Promise<L0OrchestratorType> | null = null;

async function getOrchestrator(): Promise<L0OrchestratorType> {
  if (!orchestratorPromise) {
    orchestratorPromise = import('vortexai-l0/orchestrator').then(
      (mod) => new mod.L0Orchestrator()
    );
  }
  return orchestratorPromise;
}

function formatL0Response(result: L0Response): string {
  const lines: string[] = [result.message];

  if (result.workflow && result.workflow.length > 0) {
    lines.push('');
    lines.push('Workflow:');
    result.workflow.forEach((step, index) => {
      lines.push(`${index + 1}. ${step}`);
    });
  }

  if (result.agents && result.agents.length > 0) {
    lines.push('');
    lines.push('Agents:');
    result.agents.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  if (result.code) {
    lines.push('');
    lines.push('Code:');
    lines.push(result.code);
  }

  if (result.related && result.related.length > 0) {
    lines.push('');
    lines.push(`Related: ${result.related.join(', ')}`);
  }

  if (result.dashboardUrl) {
    lines.push('');
    lines.push(`Dashboard: ${result.dashboardUrl}`);
  }

  if (result.data && !result.code && !result.workflow) {
    lines.push('');
    lines.push('Data:');
    lines.push(
      typeof result.data === 'string'
        ? result.data
        : JSON.stringify(result.data, null, 2)
    );
  }

  return lines.join('\n');
}

export default agent({
  model: 'claude-sonnet-4-6',
  runtime: 'claude-code',
  permissionMode: 'default',
  maxTurns: 100,
  systemPrompt: `You are VortexAI L0 deployed through 21st Agents.

Core operating mode:
- Use the orchestrate_l0 tool for L0 workflow orchestration, code lookup, and memory-style retrieval.
- Keep answers concise and practical unless the user asks for deeper detail.

SEO operating mode:
- When a request is about SEO audits, diagnosis, validation, schema, hreflang, technical crawlability, metadata, image SEO, Core Web Vitals, or competitor/keyword gaps, prioritize attached SEO skills before general reasoning.
- Skill routing guidance:
  - seo-technical: crawlability, SSR/indexability, CWV, robots/sitemaps, diagnostics
  - seo-schema: schema design/validation/fixes (JSON-LD)
  - seo-hreflang: hreflang mapping and validation
  - seo-page: on-page metadata, title/description/OG/Twitter tag quality
  - seo-images: image alt text and optimization checks
- If a requested SEO skill is not attached, clearly state that and continue with best-effort guidance.

Execution behavior:
- For audits, return: findings, severity, evidence, and prioritized fixes.
- For implementation requests, provide concrete steps and command/file-level guidance.
- Do not fabricate tool results, metrics, or crawl outcomes.`,
  tools: {
    orchestrate_l0: tool({
      description: 'Run a VortexAI L0 orchestration query against the existing L0 runtime.',
      inputSchema: z.object({
        query: z.string().min(1),
        project: z.string().optional(),
        format: z.enum(['text', 'json', 'workflow']).optional().default('text'),
      }),
      execute: async ({ query, project, format }) => {
        const orchestrator = await getOrchestrator();
        const result = await orchestrator.query(query, { project, format });

        const text =
          format === 'json'
            ? JSON.stringify(result, null, 2)
            : formatL0Response(result);

        return {
          content: [{ type: 'text', text }],
        };
      },
    }),
  },
});
