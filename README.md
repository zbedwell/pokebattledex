# PokeBattleDex

Battle-focused Pokemon strategy reference app for browsing, comparing, and evaluating Pokemon with practical battle context.

Live site: `https://pokebattledex.net`

## Highlights
- Battle-focused Pokemon directory with filtering, sorting, and quick compare selection.
- Pokemon detail profiles with role tags, strengths/weaknesses, notable moves, abilities, and type matchup panels.
- Evolution line support, including transformation branches for Mega Evolutions and Primal forms.
- Obtain methods by game with battle-transformation handling for Mega/Primal forms.
- Move and ability directories with detail pages.
- Type matchup tool and chart endpoints.
- Global search across Pokemon, moves, abilities, and types.
- Compare tool for 2-4 Pokemon side by side.

## Tech Stack
- Frontend: React 19, Vite 5, Tailwind CSS, React Router.
- Backend: Node.js, Express, PostgreSQL (`pg`).
- Data pipeline: local normalized JSON generation from PokeAPI, seeded into Postgres.
- Deployment: Vercel (single project for static client + serverless API function).

## Project Structure
- `client/` frontend app.
- `server/` API, services, repositories, DB scripts, tests.
- `api/` Vercel serverless catch-all wrapper for `/api/*`.
- `data/normalized/` normalized data used by seed scripts.
- `scripts/generate-normalized-data.mjs` dataset generator.
- `docs/` product and data assumptions docs.

## Local Development
1. Install dependencies:
   - `npm install`
   - `npm --prefix client install`
   - `npm --prefix server install`
2. Copy `.env.example` to `.env` and set DB values.
3. Create schema and seed data:
   - `npm run setup:fresh`
4. Start development servers:
   - `npm run dev`

Client runs on `5173` and proxies `/api` to backend on `4000` in dev.

## Environment Variables
Core runtime vars:
- `DATABASE_URL` (recommended, managed Postgres URI).
- `DB_USE_SSH_TUNNEL` (`false` for Vercel/direct DB).
- `PGSSL` (`true` for managed Postgres providers).
- `PGSSL_REJECT_UNAUTHORIZED` (provider-dependent, often `false`).

If `DATABASE_URL` is not set, the app falls back to host/user/password values from `.env`.

## Deploying to Vercel
This repo is configured for a single Vercel project (`vercel.json`) serving both frontend and API.

1. Import repo into Vercel.
2. Set Production env vars:
   - `NODE_ENV=production`
   - `DATABASE_URL=<real Postgres connection URI>`
   - `DB_USE_SSH_TUNNEL=false`
   - `PGSSL=true`
   - `PGSSL_REJECT_UNAUTHORIZED=false` (adjust to provider guidance)
3. Run migrations + seed against that database:
   - `npm run migrate`
   - `npm run seed`
4. Deploy:
   - `npx vercel --prod`
5. Verify:
   - `/api/health/data`
   - `/api/pokemon?limit=1`

## API Overview
All endpoints are namespaced under `/api`:
- `/api/pokemon`
- `/api/pokemon/options`
- `/api/pokemon/:id`
- `/api/pokemon/:id/evolution`
- `/api/pokemon/compare`
- `/api/moves`
- `/api/moves/:id`
- `/api/abilities`
- `/api/abilities/:id`
- `/api/types`
- `/api/types/chart`
- `/api/types/matchup`
- `/api/types/defense`
- `/api/search`
- `/api/health/data`

## Useful Commands
- `npm run dev` - start frontend + backend in development.
- `npm run build` - build frontend.
- `npm run test` - run backend test suite.
- `npm run create-db` - create database (for local non-managed flows).
- `npm run migrate` - run SQL migration.
- `npm run seed` - seed normalized data.
- `npm run setup` - migrate + seed.
- `npm run setup:fresh` - create DB + migrate + seed.
- `npm run generate:data` - regenerate normalized data (default scope).
- `npm run generate:data:gen7-9` - regenerate Gen 7-9 only.
- `npm run generate:data:all` - regenerate all supported generations.

## Notes
- Runtime API requests do not scrape external sources.
- Data served by the app depends on the last generated/seeded dataset.
- Legacy static implementation is archived under `legacy-static/`.
