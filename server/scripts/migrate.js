import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDbConnection } from "../src/db/tunnelPool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const migrationPath = path.resolve(__dirname, "../db/migrations/001_init.sql");
  const sql = await fs.readFile(migrationPath, "utf8");

  const db = await getDbConnection();
  await db.pool.query(sql);

  console.log("Migration completed: 001_init.sql");
  await db.close();
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
