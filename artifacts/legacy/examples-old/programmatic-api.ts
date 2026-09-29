/**
 * Example: Using VortexAI L0 Programmatic API
 * 
 * This example demonstrates how to use the L0Orchestrator in your own applications.
 */

import { L0Orchestrator, type L0Response } from 'vortexai-l0/orchestrator';

async function main() {
  // Create an orchestrator instance
  const orchestrator = new L0Orchestrator();

  // Example 1: Orchestrate a social media campaign
  console.log('Example 1: Campaign Orchestration');
  console.log('==================================');
  const campaignResponse = await orchestrator.query('create viral TikTok campaign for eco-friendly product');
  console.log('Response:', campaignResponse.message);
  console.log('Workflow steps:', campaignResponse.workflow?.length);
  console.log('Agents involved:', campaignResponse.agents?.length);
  console.log('');

  // Example 2: Find code snippets
  console.log('Example 2: Code Snippet Search');
  console.log('==============================');
  const codeResponse = await orchestrator.findCode('floating notification card');
  if (codeResponse.code) {
    console.log('Found code snippet:', codeResponse.data?.title);
    console.log('Language:', codeResponse.data?.language);
    console.log('Tags:', codeResponse.data?.tags);
  }
  console.log('');

  // Example 3: Search memories
  console.log('Example 3: Memory Search');
  console.log('========================');
  const memoryResponse = await orchestrator.searchMemories('oauth implementation');
  console.log('Found memories:', memoryResponse.message);
  console.log('');

  // Example 4: Analyze trends
  console.log('Example 4: Trend Analysis');
  console.log('========================');
  const trendResponse = await orchestrator.analyzeTrends('analyze trending hashtags for sustainability');
  console.log('Trend analysis:', trendResponse.message);
  if (trendResponse.data) {
    console.log('Trending hashtags:', JSON.stringify(trendResponse.data, null, 2));
  }
  console.log('');

  // Example 5: Get help
  console.log('Example 5: Get Help');
  console.log('==================');
  const helpResponse = await orchestrator.getHelp('social media');
  console.log('Help response:', helpResponse.message);
  console.log('Related topics:', helpResponse.related);
}

// Run examples
main().catch(console.error);

