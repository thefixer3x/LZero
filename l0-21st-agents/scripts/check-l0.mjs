import { L0Orchestrator } from 'vortexai-l0/orchestrator';

const orchestrator = new L0Orchestrator();
const result = await orchestrator.query('memory oauth implementation patterns');

console.log(`L0 import: ok`);
console.log(`L0 sample query: ${result.type}`);
console.log(result.message);
