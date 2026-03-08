const buildMoveFilters = (filters, values) => {
  const clauses = [];

  if (filters.q) {
    values.push(`%${filters.q}%`);
    clauses.push(`LOWER(m.name) LIKE LOWER($${values.length})`);
  }

  if (filters.type) {
    values.push(filters.type);
    clauses.push(`LOWER(t.name) = LOWER($${values.length})`);
  }

  if (filters.category) {
    values.push(filters.category);
    clauses.push(`m.category = $${values.length}`);
  }

  if (filters.min_power !== undefined) {
    values.push(filters.min_power);
    clauses.push(`COALESCE(m.power, 0) >= $${values.length}`);
  }

  if (filters.max_power !== undefined) {
    values.push(filters.max_power);
    clauses.push(`COALESCE(m.power, 0) <= $${values.length}`);
  }

  if (filters.min_accuracy !== undefined) {
    values.push(filters.min_accuracy);
    clauses.push(`COALESCE(m.accuracy, 100) >= $${values.length}`);
  }

  if (filters.is_status !== undefined) {
    clauses.push(filters.is_status ? `m.category = 'Status'` : `m.category <> 'Status'`);
  }

  return clauses;
};

const sortMap = {
  name: "m.name",
  power: "COALESCE(m.power, -1)",
  accuracy: "COALESCE(m.accuracy, 101)",
  pp: "m.pp",
};

export const createMovesRepository = (db) => ({
  async listMoves(filters = {}) {
    const values = [];
    const clauses = buildMoveFilters(filters, values);

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

    const sortColumn = sortMap[filters.sort] ?? sortMap.name;
    const order = filters.order === "desc" ? "DESC" : "ASC";

    values.push(filters.limit ?? 20, ((filters.page ?? 1) - 1) * (filters.limit ?? 20));
    const limitIndex = values.length - 1;
    const offsetIndex = values.length;

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
        m.priority
      FROM battleex.moves m
      JOIN battleex.types t ON t.id = m.type_id
      ${whereSql}
      ORDER BY ${sortColumn} ${order}, m.name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const rows = await db.query(query, values);

    const countValues = values.slice(0, values.length - 2);
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM battleex.moves m
      JOIN battleex.types t ON t.id = m.type_id
      ${whereSql}
    `;

    const countResult = await db.query(countQuery, countValues);
    return { rows: rows.rows, total: Number(countResult.rows[0]?.total ?? 0) };
  },

  async getMoveByIdentifier(identifier) {
    const isNumeric = /^\d+$/.test(String(identifier));
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
        m.priority
      FROM battleex.moves m
      JOIN battleex.types t ON t.id = m.type_id
      WHERE ${isNumeric ? "m.id = $1" : "LOWER(m.name) = LOWER($1)"}
      LIMIT 1
    `;

    const value = isNumeric ? Number(identifier) : String(identifier);
    const result = await db.query(query, [value]);
    return result.rows[0] ?? null;
  },

  async getPokemonByMove(moveId, limit = 24) {
    const query = `
      SELECT p.id, p.name, p.national_dex_number, p.sprite_url
      FROM battleex.pokemon_moves pm
      JOIN battleex.pokemon p ON p.id = pm.pokemon_id
      WHERE pm.move_id = $1
      ORDER BY pm.is_notable_battle_move DESC, p.national_dex_number ASC
      LIMIT $2
    `;

    const result = await db.query(query, [moveId, limit]);
    return result.rows;
  },

  async searchMoves(q, limit = 6) {
    const query = `
      SELECT id, name
      FROM battleex.moves
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT $2
    `;

    const result = await db.query(query, [`%${q}%`, limit]);
    return result.rows;
  },
});
