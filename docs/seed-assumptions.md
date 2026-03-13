# BattleDex Seed Assumptions

- Data scope is configurable by generation when running `scripts/generate-normalized-data.mjs`.
  - Default: Generation 1 only.
  - Example: `--max-gen=3` for Generations 1-3.
- Source files in `data/normalized/` are generated from PokeAPI and then seeded locally.
- `pokemonMoves.json` contains a curated notable subset per Pokemon based on generation-priority version groups and learn methods (level-up, machine, tutor, egg priorities).
- `pokemon.json` includes `obtainMethodsByGame`, primarily from PokeAPI encounter endpoints.
- For modern games with sparse encounter endpoint coverage (Lets Go onward), generation augments availability from:
  - PokeAPI regional/DLC Pokedex resources (`letsgo-kanto`, `galar`, `isle-of-armor`, `crown-tundra`, `hisui`, `paldea`, `kitakami`, `blueberry`).
  - PokeAPI modern version-group compatibility signals (`sword-shield`, `brilliant-diamond-shining-pearl`, `legends-arceus`, `scarlet-violet`) when no encounter/pokedex location rows exist.
- `Legends: Z-A` remains a placeholder in API responses; PokeAPI currently has no corresponding version/pokedex data to source encounters from.
- Pokemon detail responses always include the full Gen 1-9 game list plus `Legends: Z-A`; missing encounters are returned as `Not obtainable` for that game.
- `base_stat_total` is computed during seed as `HP + Attack + Defense + Special Attack + Special Defense + Speed`.
- Ability and move effect text are normalized to ASCII for consistency.
- The runtime app only reads from PostgreSQL; it does not scrape or fetch external APIs per request.
