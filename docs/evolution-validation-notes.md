# Evolution Validation Notes

This document tracks manual spot checks for evolution labels shown in BattleDex.
Data is sourced from PokeAPI chain/species resources and can be corrected with
`data/normalized/evolutionLabelOverrides.json`.

## Spot Checks
- Eevee line (`chain:67`) reviewed for stone-based branches.
- Tyrogue line pending manual review.
- Gloom split line pending manual review.
- Poliwag split line pending manual review.
- Slowpoke split line pending manual review.

## Override Policy
- Use generator output as default.
- If label text is unclear in UI, add a targeted edge override keyed by
  `chain:<source_chain_id>:<from_dex>-><to_dex>`.
- Keep overrides minimal and include rationale in commit notes.
