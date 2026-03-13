CREATE SCHEMA IF NOT EXISTS battleex;

CREATE TABLE IF NOT EXISTS battleex.types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS battleex.pokemon (
  id SERIAL PRIMARY KEY,
  profile_key VARCHAR(120),
  national_dex_number INT NOT NULL,
  name VARCHAR(90) UNIQUE NOT NULL,
  form_name VARCHAR(60),
  is_regional_variant BOOLEAN NOT NULL DEFAULT FALSE,
  primary_type_id INT NOT NULL REFERENCES battleex.types(id),
  secondary_type_id INT REFERENCES battleex.types(id),
  hp INT NOT NULL,
  attack INT NOT NULL,
  defense INT NOT NULL,
  special_attack INT NOT NULL,
  special_defense INT NOT NULL,
  speed INT NOT NULL,
  base_stat_total INT NOT NULL,
  sprite_url TEXT,
  description_short TEXT,
  generation INT,
  introduced_in_game VARCHAR(40),
  obtain_methods JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE battleex.pokemon
  ADD COLUMN IF NOT EXISTS profile_key VARCHAR(120),
  ADD COLUMN IF NOT EXISTS form_name VARCHAR(60),
  ADD COLUMN IF NOT EXISTS is_regional_variant BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS obtain_methods JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE battleex.pokemon
SET profile_key = COALESCE(profile_key, national_dex_number::text)
WHERE profile_key IS NULL;

ALTER TABLE battleex.pokemon
  ALTER COLUMN profile_key SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pokemon_national_dex_number_key'
      AND connamespace = 'battleex'::regnamespace
  ) THEN
    ALTER TABLE battleex.pokemon DROP CONSTRAINT pokemon_national_dex_number_key;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS battleex.abilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  short_effect TEXT,
  full_effect TEXT,
  is_battle_relevant BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS battleex.moves (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  type_id INT NOT NULL REFERENCES battleex.types(id),
  category VARCHAR(20) NOT NULL CHECK (category IN ('Physical', 'Special', 'Status')),
  power INT,
  accuracy INT,
  pp INT NOT NULL,
  short_effect TEXT,
  full_effect TEXT,
  priority INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS battleex.pokemon_abilities (
  pokemon_id INT NOT NULL REFERENCES battleex.pokemon(id) ON DELETE CASCADE,
  ability_id INT NOT NULL REFERENCES battleex.abilities(id) ON DELETE CASCADE,
  slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('primary', 'secondary', 'hidden')),
  PRIMARY KEY (pokemon_id, ability_id, slot_type)
);

CREATE TABLE IF NOT EXISTS battleex.pokemon_moves (
  pokemon_id INT NOT NULL REFERENCES battleex.pokemon(id) ON DELETE CASCADE,
  move_id INT NOT NULL REFERENCES battleex.moves(id) ON DELETE CASCADE,
  learn_method VARCHAR(40),
  is_notable_battle_move BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (pokemon_id, move_id)
);

CREATE TABLE IF NOT EXISTS battleex.type_effectiveness (
  attacking_type_id INT NOT NULL REFERENCES battleex.types(id) ON DELETE CASCADE,
  defending_type_id INT NOT NULL REFERENCES battleex.types(id) ON DELETE CASCADE,
  multiplier NUMERIC(4, 2) NOT NULL,
  PRIMARY KEY (attacking_type_id, defending_type_id)
);

CREATE TABLE IF NOT EXISTS battleex.evolution_families (
  id SERIAL PRIMARY KEY,
  source_chain_id INT UNIQUE NOT NULL,
  is_branched BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS battleex.evolution_nodes (
  family_id INT NOT NULL REFERENCES battleex.evolution_families(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES battleex.pokemon(id) ON DELETE CASCADE,
  depth INT NOT NULL,
  display_order INT NOT NULL,
  display_name TEXT,
  path_key TEXT,
  PRIMARY KEY (family_id, pokemon_id)
);

ALTER TABLE battleex.evolution_nodes
  ADD COLUMN IF NOT EXISTS display_name TEXT;

CREATE TABLE IF NOT EXISTS battleex.evolution_edges (
  family_id INT NOT NULL REFERENCES battleex.evolution_families(id) ON DELETE CASCADE,
  from_pokemon_id INT NOT NULL REFERENCES battleex.pokemon(id) ON DELETE CASCADE,
  to_pokemon_id INT NOT NULL REFERENCES battleex.pokemon(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  tooltip TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (family_id, from_pokemon_id, to_pokemon_id),
  CHECK (from_pokemon_id <> to_pokemon_id)
);

CREATE INDEX IF NOT EXISTS idx_pokemon_name ON battleex.pokemon (LOWER(name));
CREATE UNIQUE INDEX IF NOT EXISTS idx_pokemon_profile_key ON battleex.pokemon (profile_key);
CREATE INDEX IF NOT EXISTS idx_pokemon_speed ON battleex.pokemon (speed);
CREATE INDEX IF NOT EXISTS idx_pokemon_bst ON battleex.pokemon (base_stat_total);
CREATE INDEX IF NOT EXISTS idx_moves_name ON battleex.moves (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_moves_power ON battleex.moves (power);
CREATE INDEX IF NOT EXISTS idx_moves_type ON battleex.moves (type_id);
CREATE INDEX IF NOT EXISTS idx_abilities_name ON battleex.abilities (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_evolution_nodes_pokemon ON battleex.evolution_nodes (pokemon_id);
CREATE INDEX IF NOT EXISTS idx_evolution_nodes_depth ON battleex.evolution_nodes (family_id, depth, display_order);
CREATE INDEX IF NOT EXISTS idx_evolution_edges_family_sort ON battleex.evolution_edges (family_id, sort_order);
