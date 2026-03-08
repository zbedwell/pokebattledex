const baseSelect = `
  SELECT
    p.id,
    p.profile_key,
    p.national_dex_number,
    p.name,
    p.form_name,
    p.is_regional_variant,
    t1.name AS primary_type,
    t2.name AS secondary_type,
    p.hp,
    p.attack,
    p.defense,
    p.special_attack,
    p.special_defense,
    p.speed,
    p.base_stat_total,
    p.sprite_url,
    p.description_short,
    p.generation,
    p.introduced_in_game,
    COALESCE(
      JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
          'name', a.name,
          'slot_type', pa.slot_type,
          'short_effect', a.short_effect,
          'full_effect', a.full_effect
        )
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'
    ) AS abilities
  FROM battleex.pokemon p
  JOIN battleex.types t1 ON t1.id = p.primary_type_id
  LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
  LEFT JOIN battleex.pokemon_abilities pa ON pa.pokemon_id = p.id
  LEFT JOIN battleex.abilities a ON a.id = pa.ability_id
`;

const buildPokemonFilters = (filters, values) => {
  const clauses = [];

  if (filters.q) {
    values.push(`%${filters.q}%`);
    clauses.push(`LOWER(p.name) LIKE LOWER($${values.length})`);
  }

  if (filters.type) {
    values.push(filters.type);
    clauses.push(`(LOWER(t1.name) = LOWER($${values.length}) OR LOWER(COALESCE(t2.name, '')) = LOWER($${values.length}))`);
  }

  if (filters.type1 && filters.type2) {
    values.push(filters.type1, filters.type2);
    const type1Index = values.length - 1;
    const type2Index = values.length;
    clauses.push(`(
      (LOWER(t1.name) = LOWER($${type1Index}) AND LOWER(COALESCE(t2.name, '')) = LOWER($${type2Index}))
      OR
      (LOWER(t1.name) = LOWER($${type2Index}) AND LOWER(COALESCE(t2.name, '')) = LOWER($${type1Index}))
    )`);
  }

  if (filters.ability) {
    values.push(filters.ability);
    clauses.push(`EXISTS (
      SELECT 1
      FROM battleex.pokemon_abilities pa2
      JOIN battleex.abilities a2 ON a2.id = pa2.ability_id
      WHERE pa2.pokemon_id = p.id AND LOWER(a2.name) = LOWER($${values.length})
    )`);
  }

  const statFilters = [
    ["min_hp", "p.hp"],
    ["min_attack", "p.attack"],
    ["min_defense", "p.defense"],
    ["min_special_attack", "p.special_attack"],
    ["min_special_defense", "p.special_defense"],
    ["min_speed", "p.speed"],
  ];

  for (const [key, column] of statFilters) {
    if (filters[key] !== undefined) {
      values.push(filters[key]);
      clauses.push(`${column} >= $${values.length}`);
    }
  }

  return clauses;
};

export const createPokemonRepository = (db) => ({
  async listPokemon(filters = {}) {
    const values = [];
    const clauses = buildPokemonFilters(filters, values);

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

    const query = `
      ${baseSelect}
      ${whereSql}
      GROUP BY p.id, t1.name, t2.name
      ORDER BY p.national_dex_number ASC
    `;

    const result = await db.query(query, values);
    return result.rows;
  },

  async getPokemonByIdentifier(identifier) {
    const isNumeric = /^\d+$/.test(String(identifier));
    const value = isNumeric ? Number(identifier) : String(identifier);

    const query = isNumeric
      ? `
          ${baseSelect}
          WHERE p.id = $1 OR p.national_dex_number = $1
          GROUP BY p.id, t1.name, t2.name
          ORDER BY
            CASE WHEN p.id = $1 THEN 0 ELSE 1 END,
            p.is_regional_variant ASC,
            p.id ASC
          LIMIT 1
        `
      : `
          ${baseSelect}
          WHERE LOWER(p.name) = LOWER($1) OR LOWER(p.profile_key) = LOWER($1)
          GROUP BY p.id, t1.name, t2.name
          ORDER BY p.is_regional_variant ASC, p.id ASC
          LIMIT 1
        `;

    const result = await db.query(query, [value]);
    return result.rows[0] ?? null;
  },

  async getPokemonByIds(ids) {
    const query = `
      ${baseSelect}
      WHERE p.id = ANY($1::int[])
      GROUP BY p.id, t1.name, t2.name
    `;

    const result = await db.query(query, [ids]);
    return result.rows;
  },

  async getPokemonMoves(pokemonId) {
    const query = `
      SELECT
        m.id,
        m.name,
        t.name AS type,
        m.category,
        m.power,
        m.accuracy,
        m.pp,
        m.short_effect,
        m.full_effect,
        m.priority,
        pm.learn_method,
        pm.is_notable_battle_move
      FROM battleex.pokemon_moves pm
      JOIN battleex.moves m ON m.id = pm.move_id
      JOIN battleex.types t ON t.id = m.type_id
      WHERE pm.pokemon_id = $1
      ORDER BY pm.is_notable_battle_move DESC, m.power DESC NULLS LAST, m.name ASC
    `;

    const result = await db.query(query, [pokemonId]);
    return result.rows;
  },

  async getPokemonAbilities(pokemonId) {
    const query = `
      SELECT
        a.id,
        a.name,
        a.short_effect,
        a.full_effect,
        pa.slot_type
      FROM battleex.pokemon_abilities pa
      JOIN battleex.abilities a ON a.id = pa.ability_id
      WHERE pa.pokemon_id = $1
      ORDER BY CASE pa.slot_type
        WHEN 'primary' THEN 1
        WHEN 'secondary' THEN 2
        ELSE 3
      END
    `;

    const result = await db.query(query, [pokemonId]);
    return result.rows;
  },

  async getPokemonSummaryById(pokemonId) {
    const query = `
      SELECT
        p.id,
        p.name,
        p.national_dex_number,
        p.sprite_url,
        t1.name AS primary_type,
        t2.name AS secondary_type
      FROM battleex.pokemon p
      JOIN battleex.types t1 ON t1.id = p.primary_type_id
      LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
      WHERE p.id = $1
      LIMIT 1
    `;

    const result = await db.query(query, [pokemonId]);
    return result.rows[0] ?? null;
  },

  async getDefaultPokemonByDex(dexNumber) {
    const query = `
      SELECT
        p.id,
        p.profile_key,
        p.national_dex_number,
        p.name,
        p.is_regional_variant,
        p.sprite_url,
        t1.name AS primary_type,
        t2.name AS secondary_type
      FROM battleex.pokemon p
      JOIN battleex.types t1 ON t1.id = p.primary_type_id
      LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
      WHERE p.national_dex_number = $1
        AND p.is_regional_variant = FALSE
      ORDER BY p.id ASC
      LIMIT 1
    `;

    const result = await db.query(query, [dexNumber]);
    return result.rows[0] ?? null;
  },

  async getPokemonByProfileKey(profileKey) {
    if (!profileKey) {
      return null;
    }

    const query = `
      SELECT
        p.id,
        p.profile_key,
        p.national_dex_number,
        p.name,
        p.is_regional_variant,
        p.sprite_url,
        t1.name AS primary_type,
        t2.name AS secondary_type
      FROM battleex.pokemon p
      JOIN battleex.types t1 ON t1.id = p.primary_type_id
      LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
      WHERE LOWER(p.profile_key) = LOWER($1)
      LIMIT 1
    `;

    const result = await db.query(query, [profileKey]);
    return result.rows[0] ?? null;
  },

  async getRegionalVariantsByDexAndToken(dexNumbers, token) {
    if (!Array.isArray(dexNumbers) || dexNumbers.length === 0 || !token) {
      return [];
    }

    const query = `
      SELECT
        p.id,
        p.profile_key,
        p.national_dex_number,
        p.name,
        p.sprite_url,
        t1.name AS primary_type,
        t2.name AS secondary_type
      FROM battleex.pokemon p
      JOIN battleex.types t1 ON t1.id = p.primary_type_id
      LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
      WHERE p.national_dex_number = ANY($1::int[])
        AND p.is_regional_variant = TRUE
        AND LOWER(p.profile_key) LIKE LOWER($2)
      ORDER BY p.national_dex_number ASC, p.id ASC
    `;

    const result = await db.query(query, [dexNumbers, `%-${token}%`]);
    return result.rows;
  },

  async getEvolutionFamilyByPokemonId(pokemonId) {
    const query = `
      SELECT
        ef.id AS family_id,
        ef.source_chain_id,
        ef.is_branched
      FROM battleex.evolution_nodes en
      JOIN battleex.evolution_families ef ON ef.id = en.family_id
      WHERE en.pokemon_id = $1
      LIMIT 1
    `;

    const result = await db.query(query, [pokemonId]);
    return result.rows[0] ?? null;
  },

  async getEvolutionNodesByFamilyId(familyId) {
    const query = `
      SELECT
        en.pokemon_id,
        COALESCE(en.display_name, p.name) AS name,
        p.national_dex_number AS dex_number,
        p.sprite_url,
        t1.name AS primary_type,
        t2.name AS secondary_type,
        en.depth,
        en.display_order
      FROM battleex.evolution_nodes en
      JOIN battleex.pokemon p ON p.id = en.pokemon_id
      JOIN battleex.types t1 ON t1.id = p.primary_type_id
      LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
      WHERE en.family_id = $1
      ORDER BY en.depth ASC, en.display_order ASC, p.national_dex_number ASC
    `;

    const result = await db.query(query, [familyId]);
    return result.rows;
  },

  async getEvolutionEdgesByFamilyId(familyId) {
    const query = `
      SELECT
        from_pokemon_id,
        to_pokemon_id,
        label,
        tooltip,
        sort_order
      FROM battleex.evolution_edges
      WHERE family_id = $1
      ORDER BY sort_order ASC, from_pokemon_id ASC, to_pokemon_id ASC
    `;

    const result = await db.query(query, [familyId]);
    return result.rows;
  },

  async listAbilityNamesByPokemon() {
    const query = `
      SELECT p.id AS pokemon_id, a.name AS ability_name
      FROM battleex.pokemon_abilities pa
      JOIN battleex.pokemon p ON p.id = pa.pokemon_id
      JOIN battleex.abilities a ON a.id = pa.ability_id
    `;

    const result = await db.query(query);
    return result.rows;
  },

  async searchPokemon(q, limit = 6) {
    const query = `
      SELECT id, name, national_dex_number
      FROM battleex.pokemon
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY national_dex_number ASC
      LIMIT $2
    `;

    const result = await db.query(query, [`%${q}%`, limit]);
    return result.rows;
  },

  async searchPokemonOptions(q, limit = 10) {
    const query = `
      SELECT
        p.id,
        p.name,
        p.national_dex_number,
        p.sprite_url,
        t1.name AS primary_type,
        t2.name AS secondary_type
      FROM battleex.pokemon p
      JOIN battleex.types t1 ON t1.id = p.primary_type_id
      LEFT JOIN battleex.types t2 ON t2.id = p.secondary_type_id
      WHERE LOWER(p.name) LIKE LOWER($1)
      ORDER BY
        CASE WHEN LOWER(p.name) LIKE LOWER($2) THEN 0 ELSE 1 END,
        p.name ASC
      LIMIT $3
    `;

    const result = await db.query(query, [`%${q}%`, `${q}%`, limit]);
    return result.rows;
  },
});
