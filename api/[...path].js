import { env } from "../server/src/config/env.js";
import { getDbConnection } from "../server/src/db/tunnelPool.js";
import { createRepositories } from "../server/src/repositories/index.js";
import { createServices } from "../server/src/services/index.js";
import { createApp } from "../server/src/app.js";

let appPromise;

const initApp = async () => {
  const db = await getDbConnection();
  const dbAdapter = {
    query: (text, values = []) => db.pool.query(text, values),
  };

  const repositories = createRepositories(dbAdapter);
  const services = createServices(repositories);
  const preflight = await services.healthService.runStartupPreflight();

  if (!preflight.seeded) {
    console.warn("BattleDex preflight: database is connected but not seeded. Run: npm run setup");
  }

  return createApp({ services, nodeEnv: env.nodeEnv });
};

const getApp = () => {
  if (!appPromise) {
    appPromise = initApp().catch((error) => {
      // Allow retries on the next invocation if cold-start initialization fails once.
      appPromise = undefined;
      throw error;
    });
  }
  return appPromise;
};

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Failed to initialize API handler:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}
