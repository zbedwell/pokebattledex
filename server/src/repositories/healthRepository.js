const REQUIRED_TABLES = [
  "types",
  "pokemon",
  "abilities",
  "moves",
  "pokemon_abilities",
  "pokemon_moves",
  "type_effectiveness",
  "evolution_families",
  "evolution_nodes",
  "evolution_edges",
];

export const createHealthRepository = (db) => ({
  async getTablePresence() {
    const result = await db.query(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'battleex'
          AND table_name = ANY($1::text[])
      `,
      [REQUIRED_TABLES],
    );

    const existing = new Set(result.rows.map((row) => row.table_name));
    const missing = REQUIRED_TABLES.filter((table) => !existing.has(table));

    return {
      required: REQUIRED_TABLES,
      missing,
    };
  },

  async getSeedCounts() {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*)::INT FROM battleex.pokemon) AS pokemon,
        (SELECT COUNT(*)::INT FROM battleex.moves) AS moves
    `);

    return {
      pokemon: Number(result.rows[0]?.pokemon ?? 0),
      moves: Number(result.rows[0]?.moves ?? 0),
    };
  },
});
