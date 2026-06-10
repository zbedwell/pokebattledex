// One-off cleanup: remove chronologically impossible obtainMethodsByGame
// entries that crept in when species-level game availability was applied to
// forms. Covers mega forms (new Z-A megas existed nowhere before Legends:
// Z-A; ORAS-introduced megas were not in X/Y; only Kanto megas are in
// Let's Go) and regional variants (Galarian/Hisuian/Paldean forms cannot
// appear in games that predate them; BDSP has no regional forms; Legends:
// Arceus has no Alolan forms except the Vulpix line).
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pokemonPath = path.resolve(__dirname, "../data/normalized/pokemon.json");

// Species with a Gen 6-era mega (X/Y or ORAS).
const CLASSIC_MEGA_DEX = new Set([
  3, 6, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142, 150, 181, 208, 212, 214,
  229, 248, 254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354,
  359, 362, 373, 376, 380, 381, 384, 428, 445, 448, 460, 475, 531, 719,
]);

// Megas whose stones were introduced in Omega Ruby/Alpha Sapphire, not X/Y.
const ORAS_ONLY_MEGA_DEX = new Set([
  15, 18, 80, 208, 254, 260, 302, 319, 323, 334, 362, 373, 376, 380, 381, 384,
  428, 475, 531, 719,
]);

const GALARIAN_GAMES = new Set(["Sword", "Shield", "Scarlet", "Violet", "Legends: Z-A"]);
const HISUIAN_GAMES = new Set(["Legends: Arceus", "Scarlet", "Violet", "Legends: Z-A"]);
const PALDEAN_GAMES = new Set(["Scarlet", "Violet", "Legends: Z-A"]);
// The only Alolan forms obtainable in Legends: Arceus.
const ALOLAN_IN_PLA = new Set(["37-vulpix-alola", "38-ninetales-alola"]);

const run = async () => {
  const pokemon = JSON.parse(await fs.readFile(pokemonPath, "utf8"));
  const removals = [];

  for (const entry of pokemon) {
    const dex = entry.nationalDexNumber;
    const isMega = /Mega/.test(entry.formName || "");
    const isNewMega =
      isMega && (!CLASSIC_MEGA_DEX.has(dex) || /Mega Z/.test(entry.formName));

    const keepGame = (game) => {
      if (isNewMega) {
        return game === "Legends: Z-A";
      }
      if (isMega) {
        if (/Let's Go/.test(game) && dex > 151) return false;
        if ((game === "X" || game === "Y") && ORAS_ONLY_MEGA_DEX.has(dex)) return false;
        return true;
      }
      switch (entry.formName) {
        case "Galarian":
          return GALARIAN_GAMES.has(game);
        case "Hisuian":
          return HISUIAN_GAMES.has(game);
        case "Paldean":
          return PALDEAN_GAMES.has(game);
        case "Alolan":
          if (game === "Brilliant Diamond" || game === "Shining Pearl") return false;
          if (game === "Legends: Arceus" && !ALOLAN_IN_PLA.has(entry.profileKey)) return false;
          return true;
        default:
          return true;
      }
    };

    const before = entry.obtainMethodsByGame || [];
    const after = before.filter((g) => keepGame(g.game));
    if (after.length !== before.length) {
      removals.push(
        `${entry.profileKey}: removed ${before
          .filter((g) => !keepGame(g.game))
          .map((g) => g.game)
          .join(", ")}`,
      );
      entry.obtainMethodsByGame = after;
    }
    if (after.length === 0) {
      throw new Error(`${entry.profileKey} would have no obtain entries left`);
    }

    // New Z-A megas did not exist in Gen 6; correct the introduction info.
    if (isNewMega && entry.generation !== 9) {
      entry.generation = 9;
      entry.introducedInGame = "Legends: Z-A";
    }

    // Hisuian forms debuted in Legends: Arceus, not Sword/Shield.
    if (entry.formName === "Hisuian" && entry.introducedInGame !== "Legends: Arceus") {
      entry.introducedInGame = "Legends: Arceus";
    }
  }

  await fs.writeFile(pokemonPath, `${JSON.stringify(pokemon, null, 2)}\n`, "utf8");
  console.log(removals.join("\n"));
  console.log(`\n${removals.length} profiles cleaned.`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
