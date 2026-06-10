import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDbConnection } from "../src/db/tunnelPool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const migrationsDir = path.resolve(__dirname, "../db/migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const db = await getDbConnection();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await db.pool.query(sql);
    console.log(`Migration completed: ${file}`);
  }

  await db.close();
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
