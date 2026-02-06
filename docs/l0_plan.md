Plan

Title: VortexCore Memory Intelligence — Apps SDK Rebrand + UI

Summary

Rebrand the enterprise MCP server as VortexCore Memory Intelligence with Memory as the core product and Intelligence + Behavior as add‑ons.
Add an Apps SDK UI resource (text/html;profile=mcp-app) and wire tool responses to the UI via _meta.ui.resourceUri and structuredContent.
Build a bundled UI that matches l0.vortexcore.app’s visual language (Inter, blue primary #2465ED, light/dark variables) and ship it from the MCP server.
Implementation Steps

Bring enterprise‑mcp into the monorepo

Create a new Nx app in the monorepo, e.g. apps/vortexcore-mcp, by copying the enterprise MCP code from /Users/seyederick/DevOps/_project_folders/mcp-monorepo/packages/enterprise-mcp-submodule.
Add project.json similar to other Nx apps (like apps/vortexai-l0/L0-saas-index) for build/dev/test targets.
Keep apps/mcp-core as is (no replacement), and make apps/vortexcore-mcp the Apps SDK backend.
Rebrand server metadata and docs

Update MCP server metadata in index.ts (name/title/description/icons/website) to “VortexCore Memory Intelligence”.
Update .well-known responses and server card to use the new brand and placeholder domain mcp.vortexcore.app.
Update manifest.json, README.md, and CLIENT-SETUP.md under apps/vortexcore-mcp to reflect the rebrand and new messaging.
Reword tool and prompt descriptions to emphasize memory as the core and Intelligence/Behavior as add‑ons.
Keep tool names and schemas unchanged to avoid breaking clients.
Apps SDK UI integration in MCP server

Add dependency @modelcontextprotocol/ext-apps to package.json.
Register a UI resource using registerAppResource with mimeType: "text/html;profile=mcp-app" and _meta.ui.domain set to https://mcp.vortexcore.app.
Add a simple “entry tool” (e.g., open_vortexcore_workspace) that returns _meta.ui.resourceUri pointing at the UI resource.
For core memory tools (create_memory, search_memories, list_memories, memory_stats), return structuredContent alongside existing content and attach _meta.ui.resourceUri so the UI can render results without breaking existing MCP clients.
Keep OAuth metadata pointing at auth.lanonasis.com via AUTH_BASE_URL, with a note to switch later.
Build the UI bundle (matching L0 style)

Create a new UI app (e.g., apps/vortexcore-ui) using Vite + React + Tailwind.
Copy design tokens from globals.css and tailwind.config.ts to match typography and color (#2465ED primary).
UI layout:
Hero: “Memory is the system of record for compliance”.
Primary action: “Capture memory” and “Search memory”.
Secondary cards: “Compliance Risk Review”, “KYB Onboarding”, “Cross‑border Payments”, “UBO Verification”.
Add‑ons section: Intelligence (insights, duplicates, related) and Behavior (workflow recall).
Use the UI bridge (ui.callTool, ui.fetch) to invoke MCP tools via JSON‑RPC.
Produce a static bundle and place the compiled index.html + assets under apps/vortexcore-mcp/dist/ui (or similar), then serve it via the MCP resource.
CSP and external assets

If the UI bundle references external assets (fonts/images), add them to the widget resource_domains.
If you later embed l0.vortexcore.app as an iframe, add it to frame_domains (optional; use only if needed).
Public API / Interface Changes

New MCP resource: ui://vortexcore/workspace returning text/html;profile=mcp-app.
New tool: open_vortexcore_workspace (returns _meta.ui.resourceUri).
Tool responses gain structuredContent plus _meta.ui.resourceUri (no schema breaking changes).
Test Cases and Scenarios

resources/list includes the UI resource and correct MIME type.
resources/read returns valid HTML for the UI resource.
tools/list includes open_vortexcore_workspace.
tools/call for open_vortexcore_workspace returns _meta.ui.resourceUri.
Core memory tools still return content and now also structuredContent.
Manual UI verification: UI loads in ChatGPT, can call create_memory, search_memories, and shows results.
Assumptions

We will keep auth.lanonasis.com in OAuth metadata for now and add auth.vortexcore.app later via config.
UI will be bundled and served from the MCP server first (no iframe).
Memory types remain unchanged; compliance categories are expressed via tags/metadata.