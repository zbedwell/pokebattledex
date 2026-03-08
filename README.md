# Pokemon BattleDex MVP

BattleDex is a battle-focused Pokemon strategy reference app.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL (`pg`)
- Data access: internal SSH tunnel support (`tunnel-ssh`)

## Repository Layout
- `client/` React frontend
- `server/` Express API, services, repositories, utilities
- `data/normalized/` normalized seed source files
- `scripts/generate-normalized-data.mjs` local dataset generator
- `docs/seed-assumptions.md` seed assumptions and constraints
- `docs/battledex-ui-design-spec.md` product polish visual system specification
- `docs/battledex-about-page-copy.md` production-ready About page copy pack

## API Namespace
All routes are under `/api`:
- `/api/pokemon`
- `/api/pokemon/options`
- `/api/pokemon/:id/evolution`
- `/api/moves`
- `/api/abilities`
- `/api/types`
- `/api/search`
- `/api/health/data`

## Quick Start
1. Install dependencies:
   - `npm install`
   - `npm --prefix client install`
   - `npm --prefix server install`
2. Create `.env` from `.env.example` and set DB values.
   - For a new local Postgres database, keep `DB_USE_SSH_TUNNEL=false`.
   - For SSH-tunneled DB, set `DB_USE_SSH_TUNNEL=true` and fill SSH fields.
3. Create a new database and load schema/data:
   - `npm run setup:fresh`
4. Start dev mode:
   - `npm run dev`

## Useful Commands
- Regenerate normalized data (Gen 1 default): `npm run generate:data`
- Regenerate normalized data for all generations: `npm run generate:data:all`
- Regenerate normalized data for selected generations: `node scripts/generate-normalized-data.mjs --gens=1,2,3` or `--max-gen=3`
- Create database only: `npm run create-db`
- Run migration + seed only: `npm run setup`
- Backend tests: `npm --prefix server run test`
- Frontend build: `npm --prefix client run build`
- Production server start: `npm run start`

## Notes
- The app queries local PostgreSQL data only.
- Runtime API requests do not scrape external sources.
- Data scope depends on your latest generator run (default Gen 1, configurable to more generations).
- Active app is `client/` + `server/`; old static flow is archived in `legacy-static/`.
