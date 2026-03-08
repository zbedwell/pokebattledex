export const createTypesRepository = (db) => ({
  async listTypes() {
    const result = await db.query(`SELECT id, name FROM battleex.types ORDER BY id ASC`);
    return result.rows;
  },

  async getTypeChartRows() {
    const query = `
      SELECT
        ta.name AS attacking_type,
        td.name AS defending_type,
        te.multiplier
      FROM battleex.type_effectiveness te
      JOIN battleex.types ta ON ta.id = te.attacking_type_id
      JOIN battleex.types td ON td.id = te.defending_type_id
      ORDER BY ta.id, td.id
    `;

    const result = await db.query(query);
    return result.rows;
  },

  async searchTypes(q, limit = 6) {
    const query = `
      SELECT id, name
      FROM battleex.types
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY id ASC
      LIMIT $2
    `;

    const result = await db.query(query, [`%${q}%`, limit]);
    return result.rows;
  },
});
