export const DEFAULT_APPROVAL_POLICY = {
    defaultRequiresApproval: true,
    classesRequiringApproval: ['write', 'execute', 'agent'],
    toolOverrides: {
        memory_search: { requiresApproval: false },
        memory_list: { requiresApproval: false },
        get_status: { requiresApproval: false },
    },
};
export function classifyTool(name) {
    const lower = name.toLowerCase();
    if (lower.includes('delete') || lower.includes('remove') || lower.includes('rotate') || lower.includes('create')) {
        return 'write';
    }
    if (lower.includes('execute') || lower.includes('run') || lower.includes('deploy')) {
        return 'execute';
    }
    if (lower.includes('agent') || lower.includes('orchestrate')) {
        return 'agent';
    }
    return 'read';
}
export function requiresApproval(tool, policy = DEFAULT_APPROVAL_POLICY) {
    if (policy.toolOverrides[tool]) {
        return policy.toolOverrides[tool].requiresApproval;
    }
    const toolClass = classifyTool(tool);
    return policy.classesRequiringApproval.includes(toolClass);
}
//# sourceMappingURL=types.js.map