# Progress

One phase per PR. Each phase stops for review before the next begins.

| Phase | Name | Status | PR |
| --- | --- | --- | --- |
| 0 | Foundations | ✅ Merged | #1 |
| 1 | Catalog + Zustand + price engine + URL encode/decode | 🟡 In review | — |
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
- [x] CI green on the PR

**Notes**
- Cucumber step files are `.mts`; Node 24 strips types natively, so no `ts-node`/`tsx`.
- Placeholder home page only — the configurator UI arrives in Phase 2.

## Phase 1 — Catalog, store, price engine, URL

**Goal:** a typed, product-agnostic configurator domain that the UI and 3D scene render from.

**Deliverables**
- `src/data/catalog.ts`: ChairLab GT, all prices in integer centavos, declared `as const satisfies Product`
- `src/lib/configurator/types.ts`: `Product` / `Option` model; `ConfigOf<P>` derives typed selections from a catalog
- `src/lib/configurator/validation.ts`: Zod `optionSchema`, strict `configSchema`, `defaultConfig`
- `src/lib/configurator/price.ts`: `priceBreakdown` (base + non-zero lines + total), `formatCentavos`
- `src/lib/configurator/url.ts`: `encodeConfig` / `decodeConfig` (lenient, per-field fallback)
- `src/stores/configurator.ts`: Zustand store with `setOption`, `load`, `reset`

**Acceptance**
- [x] Default chair = ₱12,999; each add-on adds exactly its price; fully loaded = ₱18,298, integer
- [x] Invalid choice throws in the price engine (no silent ₱0)
- [x] URL round-trips; missing/invalid params fall back to defaults; unknown keys ignored
- [x] Strict schema rejects unknown choices, wrong types, missing and extra keys
- [x] Store set/load/reset tested; invalid values are compile errors
- [ ] CI green on the PR

**Notes**
- Pro stitching = any contrast stitching color (+₱300); tonal is free.
- URLs write every option, not just non-defaults, so shared links keep their meaning if defaults change.
- Price is derived, not stored: compute `priceBreakdown(chair, config)` in components (memoized) to avoid unstable Zustand selectors.
- Adding a product = a new `as const satisfies Product` catalog entry; the engine, schema and URL code are generic.
