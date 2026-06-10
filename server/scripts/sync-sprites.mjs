import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDbConnection } from "../src/db/tunnelPool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const syncSprites = async () => {
  const pokemonPath = path.resolve(__dirname, "../../data/normalized/pokemon.json");
  const pokemon = JSON.parse(await fs.readFile(pokemonPath, "utf8"));

  const db = await getDbConnection();

  try {
    const { rows } = await db.pool.query(
      "SELECT profile_key, sprite_url FROM battleex.pokemon",
    );
    const dbSprites = new Map(rows.map((row) => [row.profile_key, row.sprite_url]));

    let updated = 0;
    for (const entry of pokemon) {
      const profileKey = String(entry.profileKey ?? entry.nationalDexNumber);
      const spriteUrl = entry.spriteUrl ?? null;

      if (!dbSprites.has(profileKey)) {
        console.warn(`Skipping ${profileKey}: not present in database (run seed to add it).`);
        continue;
      }

      if (dbSprites.get(profileKey) === spriteUrl) {
        continue;
      }

      await db.pool.query(
        "UPDATE battleex.pokemon SET sprite_url = $1 WHERE profile_key = $2",
        [spriteUrl, profileKey],
      );
      console.log(`Updated ${profileKey}: ${dbSprites.get(profileKey)} -> ${spriteUrl}`);
      updated += 1;
    }

    console.log(`Done. ${updated} sprite URL(s) updated.`);
  } finally {
    await db.close();
  }
};

syncSprites().catch((error) => {
  console.error("Sprite sync failed:", error.message);
  process.exit(1);
});
