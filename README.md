# L0 Edge Reasoning Infrastructure (VortexAI L0)

L0 is enterprise-grade edge reasoning infrastructure with persistent memory, millisecond latency, offline-first execution, and zero per-inference costs. This repository contains the L0 SaaS landing site plus the complete messaging and positioning package used to align product, marketing, and enterprise sales.

## What's in this app

### L0 SaaS landing site
- Location: `apps/vortexai-l0/L0-saas-index`
- Stack: Next.js 15, React 19, Tailwind
- Purpose: Enterprise-focused marketing site for L0

### The complete L0 messaging package
All six core documents live in `apps/vortexai-l0/L0-saas-index/attached_assets`:

1. `L0_BRAND_COPY_1769621416262.md`
   - Master messaging framework (hero copy, features, competitive positioning)
2. `L0_ENTERPRISE_README_1769621416342.md`
   - Production-ready technical README with code examples and benchmarks
3. `L0_LANDING_PAGE_SECTIONS_1769621416350.md`
   - Drop-in landing page copy and implementation notes
4. `L0_ENTERPRISE_POSITIONING_1769621416337.md`
   - Investor and enterprise sales positioning (valuation multipliers, TAM)
5. `L0_IMPLEMENTATION_GUIDE_1769621416346.md`
   - 6-phase implementation roadmap with checklists
6. `L0_MASTER_INDEX_1769621416353.md`
   - Quick-reference "Choose Your Path" guide

## Core L0 positioning

"Reasoning Without Compromise"
- Persistent Edge Memory (the moat)
- Zero-Latency Reasoning (5-50ms)
- Complete Privacy (nothing leaves your perimeter)
- Offline-First (works anywhere, syncs when possible)
- Zero Per-Inference Costs (5-50x cheaper at scale)

## Local development (landing site)

```bash
cd apps/vortexai-l0/L0-saas-index
npm --workspaces=false install --no-package-lock
npm --workspaces=false run dev
```

## Production build (landing site)

```bash
cd apps/vortexai-l0/L0-saas-index
npm --workspaces=false run build
```

## Vercel deployment notes

- Root Directory: `apps/vortexai-l0/L0-saas-index`
- Install Command: `npm --workspaces=false install --no-package-lock`
- Build Command: `npm --workspaces=false run build`
- Output: `.next`
- Recommended env var: `NEXT_PUBLIC_SITE_URL` (used by sitemap/robots metadata)

## How to use the package

1. Start with `L0_MASTER_INDEX_1769621416353.md` to choose your path.
2. Use `L0_LANDING_PAGE_SECTIONS_1769621416350.md` for direct website copy swaps.
3. Use `L0_BRAND_COPY_1769621416262.md` for consistent messaging everywhere.
4. Use `L0_ENTERPRISE_POSITIONING_1769621416337.md` for investor and sales materials.

---

L0 is positioned to win where latency, privacy, and cost constraints are non-negotiable. Lead with Persistent Edge Memory and build from there.
