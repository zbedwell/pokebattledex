# BattleDex Seed Assumptions

- Data scope is configurable by generation when running `scripts/generate-normalized-data.mjs`.
  - Default: Generation 1 only.
  - Example: `--max-gen=3` for Generations 1-3.
- Source files in `data/normalized/` are generated from PokeAPI and then seeded locally.
- `pokemonMoves.json` contains a curated notable subset per Pokemon based on generation-priority version groups and learn methods (level-up, machine, tutor, egg priorities).
- `base_stat_total` is computed during seed as `HP + Attack + Defense + Special Attack + Special Defense + Speed`.
- Ability and move effect text are normalized to ASCII for consistency.
- The runtime app only reads from PostgreSQL; it does not scrape or fetch external APIs per request.
