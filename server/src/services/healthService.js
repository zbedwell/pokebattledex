export const createHealthService = ({ healthRepository }) => {
  const getDataHealth = async () => {
    try {
      const tablePresence = await healthRepository.getTablePresence();
      const hasSchema = tablePresence.missing.length === 0;

      if (!hasSchema) {
        return {
          status: "degraded",
          db_connected: true,
          seeded: false,
          counts: {
            pokemon: 0,
            moves: 0,
          },
          missing_tables: tablePresence.missing,
        };
      }

      const counts = await healthRepository.getSeedCounts();
      const seeded = counts.pokemon > 0 && counts.moves > 0;

      return {
        status: seeded ? "ok" : "degraded",
        db_connected: true,
        seeded,
        counts,
        missing_tables: [],
      };
    } catch {
      return {
        status: "degraded",
        db_connected: false,
        seeded: false,
        counts: {
          pokemon: 0,
          moves: 0,
        },
        missing_tables: [],
      };
    }
  };

  const runStartupPreflight = async () => {
    const health = await getDataHealth();

    if (!health.db_connected) {
      throw new Error(
        "Database connection failed during startup preflight. Verify .env credentials and SSH settings.",
      );
    }

    if (health.missing_tables.length > 0) {
      throw new Error(
        `Missing required tables in schema battleex: ${health.missing_tables.join(", ")}. Run: npm run migrate`,
      );
    }

    return health;
  };

  return {
    getDataHealth,
    runStartupPreflight,
  };
};
