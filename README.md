# ChairLab

A mobile-first 3D gaming chair configurator. Orbit, rotate and zoom a chair; swap frame, upholstery, stitching, base, lumbar pillow and RGB; watch the price update live; share your build by URL or short id. No login required.

> Status: **Phase 3 — R3F scene.** See [docs/PROGRESS.md](docs/PROGRESS.md).

## Stack

- **App:** Next.js (App Router) + TypeScript — the only public entry (BFF via Route Handlers)
- **UI:** Tailwind CSS v4, shadcn/ui, Framer Motion (UI chrome only)
- **3D:** three, @react-three/fiber, @react-three/drei (lazy-loaded, Draco GLB)
- **State/validation:** Zustand, Zod
- **Data:** Supabase (server-side only for writes; no service role in the client)
- **Tests:** Vitest (domain), Playwright (UI), Cucumber.js + Playwright (BDD)
- **Hosting:** Vercel

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # fill in values when Phase 5 lands
npm run dev
```

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

First Playwright run: `npx playwright install chromium`.

## Project layout

```
src/app/                    routes + Route Handlers
src/components/ui/          shadcn/ui primitives
src/components/chair-scene/ 3D scene (Phase 3)
src/lib/configurator/       domain: catalog, price rules, URL serialize, validation (Phase 1)
src/data/catalog.ts         catalog + prices in integer centavos (Phase 1)
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
