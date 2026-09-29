/**
 * Example: Using VortexAI L0 Programmatic API
 *
 * This example demonstrates how to use the MemoryConcierge in your own applications.
 */

import { MemoryConcierge } from 'vortexai-l0/memory-concierge';

async function main() {
  // Create a concierge instance
  const concierge = new MemoryConcierge();

  // Example 1: Search memories
  console.log('Example 1: Memory Search');
  console.log('========================');
  const memoryResponse = await concierge.search('oauth implementation');
  console.log('Response:', memoryResponse.message);
  console.log('');

  // Example 2: Recall behavioral patterns
  console.log('Example 2: Behavioral Recall');
  console.log('============================');
  const recallResponse = await concierge.recall('deployment patterns');
  console.log('Recalled:', recallResponse.message);
  if (recallResponse.workflow) {
    console.log('Workflow steps:', recallResponse.workflow.length);
  }
  console.log('');

  // Example 3: Find code snippets
  console.log('Example 3: Code Snippet Search');
  console.log('==============================');
  const codeResponse = await concierge.findSnippet('floating notification card');
  if (codeResponse.code) {
    console.log('Found code snippet:', codeResponse.data?.title);
    console.log('Language:', codeResponse.data?.language);
    console.log('Tags:', codeResponse.data?.tags);
  }
  console.log('');

  // Example 4: Get help
  console.log('Example 4: Get Help');
  console.log('==================');
  const helpResponse = await concierge.getHelp('memory');
  console.log('Help response:', helpResponse.message);
  console.log('Related topics:', helpResponse.related);
}

// Run examples
main().catch(console.error);
