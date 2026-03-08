import { env } from "./config/env.js";
import { getDbConnection } from "./db/tunnelPool.js";
import { createRepositories } from "./repositories/index.js";
import { createServices } from "./services/index.js";
import { createApp } from "./app.js";

const start = async () => {
  const db = await getDbConnection();

  const dbAdapter = {
    query: (text, values = []) => db.pool.query(text, values),
  };

  const repositories = createRepositories(dbAdapter);
  const services = createServices(repositories);
  const preflight = await services.healthService.runStartupPreflight();

  const app = createApp({ services, nodeEnv: env.nodeEnv });

  const server = app.listen(env.port, () => {
    console.log(`BattleDex API running on http://localhost:${env.port}`);
    if (!preflight.seeded) {
      console.warn("BattleDex preflight: database is connected but not seeded. Run: npm run setup");
    }
  });

  const gracefulShutdown = async () => {
    console.log("Shutting down BattleDex server...");
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
