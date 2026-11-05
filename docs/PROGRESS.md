# Progress

One phase per PR. Each phase stops for review before the next begins.

| Phase | Name | Status | PR |
| --- | --- | --- | --- |
| 0 | Foundations | 🟡 In review | — |
| 1 | Catalog + Zustand + price engine + URL encode/decode | ⬜ Not started | — |
| 2 | UI shell with flat preview | ⬜ Not started | — |
| 3 | R3F scene: orbit, materials, WebGL fallback, reduced-motion | ⬜ Not started | — |
| 4 | Wow: camera presets, RGB emissive, hotspots, screenshot | ⬜ Not started | — |
| 5 | Save/share: Supabase + RLS, POST/GET, `/b/[id]` | ⬜ Not started | — |
| 6 | Polish + Vercel launch, README GIFs, Cucumber happy path | ⬜ Not started | — |

## Phase 0 — Foundations

**Goal:** a working, tested, CI-checked skeleton every later phase builds on.

**Deliverables**
- Next.js 16 App Router + TypeScript (strict), `src/` layout, `@/*` alias
- Tailwind CSS v4 + shadcn/ui (`base-nova`, CSS variables, dark theme by default)
- Vitest (unit), Playwright (desktop + mobile Chromium), Cucumber.js + Playwright (BDD)
- GitHub Actions CI: lint → typecheck → unit → build → e2e → bdd
- README, `.env.example` (names only), this file

**Acceptance**
- [x] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass
- [x] `npm run test:e2e` passes on desktop + mobile profiles
- [x] `npm run test:bdd` passes against a running server
- [ ] CI green on the PR

**Notes**
- Cucumber step files are `.mts`; Node 24 strips types natively, so no `ts-node`/`tsx`.
- Placeholder home page only — the configurator UI arrives in Phase 2.
