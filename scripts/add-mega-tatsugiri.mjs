// One-off backfill: add the Legends Z-A Mega Dimension form Mega Tatsugiri
// (PokeAPI form 10324) to the normalized data files, following the same
// conventions as the other Z-A DLC megas (single profile per species,
// base-form abilities/moves mirrored, standard mega obtain template).
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data/normalized");

const PROFILE_KEY = "978-tatsugiri-mega";
const BASE_KEY = "978";
const SPRITE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10324.png";

const readJson = async (name) =>
  JSON.parse(await fs.readFile(path.join(dataDir, name), "utf8"));

const writeJson = async (name, value) =>
  fs.writeFile(path.join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");

const run = async () => {
  const pokemon = await readJson("pokemon.json");
  const pokemonAbilities = await readJson("pokemonAbilities.json");
  const pokemonMoves = await readJson("pokemonMoves.json");
  const evolutionNodes = await readJson("evolutionNodes.json");
  const evolutionEdges = await readJson("evolutionEdges.json");

  if (pokemon.some((entry) => entry.profileKey === PROFILE_KEY)) {
    throw new Error(`${PROFILE_KEY} already exists in pokemon.json`);
  }

  // Profile entry, with the shared mega obtain-methods template.
  const template = pokemon.find((entry) => entry.profileKey === "998-baxcalibur-mega");
  const baseIndex = pokemon.findIndex((entry) => entry.profileKey === BASE_KEY);
  pokemon.splice(baseIndex + 1, 0, {
    profileKey: PROFILE_KEY,
    nationalDexNumber: 978,
    name: "Tatsugiri (Mega)",
    formName: "Mega",
    isRegionalVariant: false,
    primaryType: "Dragon",
    secondaryType: "Water",
    hp: 68,
    attack: 65,
    defense: 90,
    specialAttack: 135,
    specialDefense: 125,
    speed: 92,
    spriteUrl: SPRITE_URL,
    generation: template.generation,
    introducedInGame: template.introducedInGame,
    descriptionShort: null,
    obtainMethodsByGame: structuredClone(template.obtainMethodsByGame),
  });

  // Abilities and notable moves mirror the base form.
  const lastAbilityIndex = pokemonAbilities.findLastIndex(
    (row) => row.pokemonProfileKey === BASE_KEY,
  );
  const megaAbilities = pokemonAbilities
    .filter((row) => row.pokemonProfileKey === BASE_KEY)
    .map((row) => ({ ...row, pokemonProfileKey: PROFILE_KEY }));
  pokemonAbilities.splice(lastAbilityIndex + 1, 0, ...megaAbilities);

  const lastMoveIndex = pokemonMoves.findLastIndex(
    (row) => row.pokemonProfileKey === BASE_KEY,
  );
  const megaMoves = pokemonMoves
    .filter((row) => row.pokemonProfileKey === BASE_KEY)
    .map((row) => ({ ...row, pokemonProfileKey: PROFILE_KEY }));
  pokemonMoves.splice(lastMoveIndex + 1, 0, ...megaMoves);

  // Evolution graph: battle-form node under the base Tatsugiri node.
  const baseNodeIndex = evolutionNodes.findIndex(
    (node) => node.pokemonProfileKey === BASE_KEY,
  );
  const baseNode = evolutionNodes[baseNodeIndex];
  evolutionNodes.splice(baseNodeIndex + 1, 0, {
    sourceChainId: baseNode.sourceChainId,
    pokemonProfileKey: PROFILE_KEY,
    depth: 1,
    displayOrder: 1,
    pathKey: "0.battle.1",
    displayName: "Tatsugiri (Mega)",
  });

  let edgeIndex = evolutionEdges.findIndex(
    (edge) => edge.sourceChainId > baseNode.sourceChainId,
  );
  if (edgeIndex === -1) {
    edgeIndex = evolutionEdges.length;
  }
  evolutionEdges.splice(edgeIndex, 0, {
    sourceChainId: baseNode.sourceChainId,
    fromPokemonProfileKey: BASE_KEY,
    toPokemonProfileKey: PROFILE_KEY,
    label: "Mega Evolution (Mega Stone)",
    tooltip: "Mega Evolution (Mega Stone)",
    sortOrder: 0,
  });

  await writeJson("pokemon.json", pokemon);
  await writeJson("pokemonAbilities.json", pokemonAbilities);
  await writeJson("pokemonMoves.json", pokemonMoves);
  await writeJson("evolutionNodes.json", evolutionNodes);
  await writeJson("evolutionEdges.json", evolutionEdges);

  console.log(
    `Added ${PROFILE_KEY}: profile, ${megaAbilities.length} abilities, ${megaMoves.length} moves, 1 node, 1 edge.`,
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
