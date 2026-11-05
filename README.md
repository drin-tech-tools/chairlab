# ChairLab

A mobile-first 3D gaming chair configurator. Orbit, rotate and zoom a chair; swap frame, upholstery, stitching, base, lumbar pillow and RGB; watch the price update live; share your build by URL or short id. No login required.

> Status: **Phase 5 — Save and share (Supabase, short links).** See [docs/PROGRESS.md](docs/PROGRESS.md).

## Stack

- **App:** Next.js (App Router) + TypeScript — the only public entry (BFF via Route Handlers)
- **UI:** Tailwind CSS v4, shadcn/ui, Framer Motion (UI chrome only)
- **3D:** three, @react-three/fiber, @react-three/drei (lazy-loaded, Draco GLB)
- **State/validation:** Zustand, Zod
- **Data:** Supabase Postgres via the BFF only (PostgREST over `fetch`, service role server-side; RLS denies the public keys)
- **Tests:** Vitest (domain), Playwright (UI), Cucumber.js + Playwright (BDD)
- **Hosting:** Vercel

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # set CONFIG_STORE=memory to run without Supabase
npm run dev
```

### Saved builds (Supabase)

1. Create a Supabase project and apply `supabase/migrations/*.sql` (SQL editor, or `supabase db push` with the CLI).
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only) in `.env.local` / Vercel.
3. Without them, `/api/configs` returns 503 and "Copy share link" falls back to the long URL.

`POST /api/configs` `{ "config": {...} }` → `201 { id, path: "/b/<id>", totalCentavos }`.
`GET /api/configs/<id>` → the saved build (immutable, cacheable). `/b/<id>` opens it in the configurator.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types + `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (desktop + mobile); starts a server if none is running |
| `npm run test:bdd` | Cucumber features; needs a server on `BASE_URL` (default `http://localhost:3000`) |
| `psql -v ON_ERROR_STOP=1 -f supabase/tests/configs_rls.sql` | Migration + RLS checks on any scratch Postgres (rolled back) |

First Playwright run: `npx playwright install chromium`. E2E uses `CONFIG_STORE=memory` (set automatically when Playwright starts the server; set it yourself if you start one).

## Project layout

```
src/app/                    routes + Route Handlers
src/components/ui/          shadcn/ui primitives
src/components/chair-scene/ 3D scene, flat fallback, camera presets, hotspots
src/components/configurator/ configurator shell, option panel, price bar
src/lib/configurator/       domain: catalog types, price rules, URL serialize, validation, share id
src/services/configs/       saved builds: repository port, Supabase + in-memory adapters, API handlers
src/data/catalog.ts         catalog + prices in integer centavos
supabase/                   migrations + SQL tests
e2e/                        Playwright specs
features/                   Cucumber features + steps
docs/                       PROGRESS.md, MODEL.md
```

## Conventions

- Money is integer centavos everywhere. Never floats.
- Secrets live in env vars only; `.env.example` lists names, never values.
- One phase per PR; PRs are reviewed and merged by a human.

## Credits

The chair is a procedural model built in code (no third-party asset). See [docs/MODEL.md](docs/MODEL.md).
