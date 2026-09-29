# Messaging Migration: VortexAI L0 → LanOnasis Memory Concierge

## Purpose

This document records the brand positioning transition of this package from a
**social-media-oriented work orchestrator** to a **memory-first concierge service**.
It captures the old positioning, the new positioning, and what changed so future
developers and AI agents can reconstruct the migration or understand why certain
design decisions were made.

## Old Positioning

| Field | Value |
|-------|-------|
| Package name | `vortexai-l0` |
| CLI name | `vortex` (aliases: `vortexai`, `l0`, `vxai`, `lzero`) |
| Tagline | "Universal Work Orchestrator" |
| Focus | Social media campaigns, content creation, trend analysis, code snippets |
| Core class | `L0Orchestrator` |
| Messaging tone | Marketing-heavy, emoji-laden, "viral campaign" framing |
| Mock data | Code snippets, social campaigns, trending hashtags |

## New Positioning

| Field | Value |
|-------|-------|
| Package name | `@lanonasis/memory-concierge` |
| CLI name | `concierge` (alias: `mc`) |
| Tagline | "Your Context-Aware Memory Concierge" |
| Focus | Memory capture, retrieval, semantic search, behavioral pattern recall |
| Core class | `MemoryConcierge` |
| Messaging tone | Professional, memory-first, concise |
| Mock data | User memories, context entries, behavioral patterns |

## Key Messaging Shifts

1. **"Orchestrator" → "Concierge"** — An orchestrator delegates tasks to agents.
   A concierge anticipates needs based on memory. The product does the latter.

2. **"Campaign / content / trends" → "Memories / context / patterns"** — The
   user-facing vocabulary now centers on memory operations: remember, search,
   recall, suggest, learn.

3. **"Viral / engagement / hashtags" → "Context / relevance / personalization"** —
   Metrics shift from marketing KPIs to memory quality indicators: recency,
   similarity, completeness.

4. **Emoji reduction** — The old CLI used heavy emoji decoration (🌪️, 🎯, 📝,
   🤖, etc.). The new output should be clean, professional text with optional
   minimal emoji for visual hierarchy only.

5. **"L0" → "Concierge"** — The platform name "L0" conveyed an AI layer, not
   a product. "Concierge" describes what it actually *does* for the user.

## Files Changed

| File | Change |
|------|--------|
| `src/concierge.ts` | Renamed from `orchestrator.ts`; `L0Orchestrator` → `MemoryConcierge` |
| `src/concierge.test.ts` | Renamed from `orchestrator.test.ts`; updated assertions |
| `src/commands/concierge.ts` | Renamed from `l0.ts`; social media commands → memory commands |
| `src/cli.ts` | CLI name `vortex` retained; aliases kept; commands updated to capture/search/recall |
| `src/plugins.ts` | `dev-tools` → `dev-workflows`, `analytics` → `memory-insights`, `collaboration` → `team-context`; all `agents: [...]` arrays removed |
| `src/concierge-contract.ts` | Removed `orchestrate` from tool classification |
| `examples/` | All examples updated to memory concierge patterns |
| `README.md` | Social media references removed; memory-first positioning |
| `package.json` | Keywords: removed `social-media`, `content-creation`; added `memory`; version bumped to 2.0.0 |

## Archived Artifacts

All pre-migration files have been migrated to `artifacts/legacy/` and are no
longer referenced in the live codebase. See `artifacts/legacy/README.md` for
details.

## Timeline

- Pre-migration: Package served as VortexAI L0 — CLI + mock orchestrator with social media framing
- Migration session: Repositioned as memory-first concierge within VortexAI L0 branding
- Post-migration: All social-media/viral/campaign framing removed or archived

