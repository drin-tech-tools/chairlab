# Progress

One phase per PR. Each phase stops for review before the next begins.

| Phase | Name | Status | PR |
| --- | --- | --- | --- |
| 0 | Foundations | ✅ Merged | #1 |
| 1 | Catalog + Zustand + price engine + URL encode/decode | 🟡 In review | #2 |
| 2 | UI shell with flat preview | 🟡 In review (stacked on #2) | — |
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

## Phase 2 — UI shell with flat preview

**Goal:** a usable configurator: pick options, see a flat preview and live price, share by URL.

**Deliverables**
- `src/app/page.tsx`: static shell + skeleton prerendered (Partial Prerender); the config for the request URL streams in the same response inside `<Suspense>`
- `src/components/configurator/`: `ConfiguratorProvider` + `useConfigurator`, `OptionPanel` (swatches, pills, switches), `PriceBar` (sticky total, `<details>` breakdown, copy share link), `UrlSync`
- `src/components/chair-scene/flat-chair.tsx`: SVG front view bound to the store (frame, upholstery color + material finish, stitching, base, lumbar, RGB glow); becomes the WebGL fallback in Phase 3
- Layout: full-bleed stage + right sidebar on desktop; stage on top + bottom sheet with sticky price bar on mobile (`100dvh`, internal scroll)
- Dark gaming tokens in `globals.css` (one volt accent), reduced-motion-gated color transitions
- `requires` on catalog choices (RGB color shows only when RGB is on); `getChoice` helper

**Acceptance**
- [x] Changing options updates the price (Playwright, desktop + mobile)
- [x] URL tracks the config; a shared URL restores it, and server HTML already has the shared price
- [x] Invalid URL values fall back to defaults
- [x] Copy share link puts the current URL on the clipboard and it reopens the same build
- [x] Every control is a native radio / `role="switch"` checkbox with a label inside a `fieldset`/`legend`
- [ ] CI green on the PR

**Notes**
- Store changed from a module singleton to `createConfiguratorStore()` + context provider (Zustand's Next.js pattern) so SSR never shares state across requests; `/b/[id]` (Phase 5) reuses it with a server-loaded config.
- `cacheComponents` is on (Next 16 default scaffold), so request data must be read inside `<Suspense>`.
- Framer Motion not added yet: nothing in this phase needs more than CSS transitions. Comes with Phase 4 camera/UI transitions.
