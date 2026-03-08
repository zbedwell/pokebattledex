const sortMap = {
  name: "a.name",
  pokemon_count: "pokemon_count",
};

export const createAbilitiesRepository = (db) => ({
  async listAbilities(filters = {}) {
    const clauses = [];
    const values = [];

    if (filters.q) {
      values.push(`%${filters.q}%`);
      clauses.push(`LOWER(a.name) LIKE LOWER($${values.length})`);
    }

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const sortColumn = sortMap[filters.sort] ?? sortMap.name;
    const order = filters.order === "desc" ? "DESC" : "ASC";

    values.push(filters.limit ?? 20, ((filters.page ?? 1) - 1) * (filters.limit ?? 20));
    const limitIndex = values.length - 1;
    const offsetIndex = values.length;

    const query = `
      SELECT
        a.id,
        a.name,
        a.short_effect,
        a.full_effect,
        a.is_battle_relevant,
        COUNT(pa.pokemon_id)::INT AS pokemon_count
      FROM battleex.abilities a
      LEFT JOIN battleex.pokemon_abilities pa ON pa.ability_id = a.id
      ${whereSql}
      GROUP BY a.id
      ORDER BY ${sortColumn} ${order}, a.name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const rows = await db.query(query, values);

    const countValues = values.slice(0, values.length - 2);
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM battleex.abilities a
      ${whereSql}
    `;

    const countResult = await db.query(countQuery, countValues);
    return { rows: rows.rows, total: Number(countResult.rows[0]?.total ?? 0) };
  },

  async getAbilityByIdentifier(identifier) {
    const isNumeric = /^\d+$/.test(String(identifier));
    const query = `
      SELECT
        a.id,
        a.name,
        a.short_effect,
        a.full_effect,
        a.is_battle_relevant,
        COUNT(pa.pokemon_id)::INT AS pokemon_count
      FROM battleex.abilities a
      LEFT JOIN battleex.pokemon_abilities pa ON pa.ability_id = a.id
      WHERE ${isNumeric ? "a.id = $1" : "LOWER(a.name) = LOWER($1)"}
      GROUP BY a.id
      LIMIT 1
    `;

    const value = isNumeric ? Number(identifier) : String(identifier);
    const result = await db.query(query, [value]);
    return result.rows[0] ?? null;
  },

  async getPokemonByAbility(abilityId, limit = 50) {
    const query = `
      SELECT
        p.id,
        p.name,
        p.national_dex_number,
        p.sprite_url,
        pa.slot_type
      FROM battleex.pokemon_abilities pa
      JOIN battleex.pokemon p ON p.id = pa.pokemon_id
      WHERE pa.ability_id = $1
      ORDER BY p.national_dex_number ASC
      LIMIT $2
    `;

    const result = await db.query(query, [abilityId, limit]);
    return result.rows;
  },

  async searchAbilities(q, limit = 6) {
    const query = `
      SELECT id, name
      FROM battleex.abilities
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT $2
    `;

    const result = await db.query(query, [`%${q}%`, limit]);
    return result.rows;
  },
});
