// Generates data/normalized/pokemonLearnsets.json (full per-version-group
// learnsets for every profile) and regenerates data/normalized/moves.json to
// cover every move referenced by any learnset.
//
// PokeAPI ids are derived from each profile's official-artwork sprite URL.
// Mega and other battle-only forms have empty movepools in PokeAPI; they
// inherit the base form's learnset, matching in-game behavior.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data/normalized");
const API_BASE = "https://pokeapi.co/api/v2";

// Main-series version groups, in release order, with their generation.
// Side games (Colosseum/XD) are excluded. PokeAPI occasionally attaches
// version groups that predate a species; entries below a species'
// introduction generation are dropped.
const VERSION_GROUP_GENERATIONS = new Map([
  ["red-blue", 1],
  ["yellow", 1],
  ["gold-silver", 2],
  ["crystal", 2],
  ["ruby-sapphire", 3],
  ["emerald", 3],
  ["firered-leafgreen", 3],
  ["diamond-pearl", 4],
  ["platinum", 4],
  ["heartgold-soulsilver", 4],
  ["black-white", 5],
  ["black-2-white-2", 5],
  ["x-y", 6],
  ["omega-ruby-alpha-sapphire", 6],
  ["sun-moon", 7],
  ["ultra-sun-ultra-moon", 7],
  ["lets-go-pikachu-lets-go-eevee", 7],
  ["sword-shield", 8],
  ["brilliant-diamond-and-shining-pearl", 8],
  ["legends-arceus", 8],
  ["scarlet-violet", 9],
  ["legends-z-a", 9],
]);
const VERSION_GROUPS = [...VERSION_GROUP_GENERATIONS.keys()];
const VERSION_GROUP_SET = new Set(VERSION_GROUPS);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, attempts = 4) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (attempt === attempts) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
      }
      await delay(500 * attempt);
    }
  }
  return null;
};

const runWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let index = 0;
  let completed = 0;

  const lanes = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
      completed += 1;
      if (completed % 100 === 0) {
        console.log(`  ${completed}/${items.length}`);
      }
    }
  });

  await Promise.all(lanes);
  return results;
};

const pickEnglish = (entries, field) => {
  const match = (entries || []).find((entry) => entry.language?.name === "en");
  return match ? match[field] : null;
};

const toDisplayName = (slug) =>
  String(slug)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const spriteIdOf = (entry) => {
  const match = /\/(\d+)\.png$/.exec(entry.spriteUrl || "");
  return match ? Number(match[1]) : null;
};

const buildLearnset = (pokemonPayload) => {
  const learnset = {};
  // De-duplicates identical (version group, method, move, level) rows.
  const seen = new Set();

  for (const moveEntry of pokemonPayload.moves || []) {
    const slug = moveEntry.move.name;
    for (const detail of moveEntry.version_group_details || []) {
      const versionGroup = detail.version_group.name;
      if (!VERSION_GROUP_SET.has(versionGroup)) {
        continue;
      }
      const method = detail.move_learn_method.name;
      const level = detail.level_learned_at || 0;
      const key = `${versionGroup}|${method}|${slug}|${level}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      learnset[versionGroup] ??= {};
      learnset[versionGroup][method] ??= [];
      learnset[versionGroup][method].push({ move: slug, level });
    }
  }

  for (const versionGroup of Object.keys(learnset)) {
    for (const method of Object.keys(learnset[versionGroup])) {
      learnset[versionGroup][method].sort(
        (a, b) => a.level - b.level || a.move.localeCompare(b.move),
      );
    }
  }

  return learnset;
};

const run = async () => {
  const pokemon = JSON.parse(
    await fs.readFile(path.join(dataDir, "pokemon.json"), "utf8"),
  );

  console.log(`Fetching learnsets for ${pokemon.length} profiles...`);
  const payloadByProfile = new Map();
  await runWithConcurrency(pokemon, 10, async (entry) => {
    const pokeapiId = spriteIdOf(entry);
    if (!pokeapiId) {
      console.warn(`No sprite-derived id for ${entry.profileKey}; skipping.`);
      return;
    }
    const payload = await fetchJson(`${API_BASE}/pokemon/${pokeapiId}`);
    await delay(20);
    if (payload) {
      payloadByProfile.set(entry.profileKey, buildLearnset(payload));
    }
  });

  // Battle-only forms (megas) have empty movepools; inherit the base form's.
  const baseByDex = new Map();
  for (const entry of pokemon) {
    if (!entry.formName) {
      baseByDex.set(entry.nationalDexNumber, entry.profileKey);
    }
  }
  let inherited = 0;
  for (const entry of pokemon) {
    const own = payloadByProfile.get(entry.profileKey);
    if (own && Object.keys(own).length > 0) {
      continue;
    }
    const baseKey = baseByDex.get(entry.nationalDexNumber);
    const base = baseKey ? payloadByProfile.get(baseKey) : null;
    if (base && Object.keys(base).length > 0) {
      payloadByProfile.set(entry.profileKey, base);
      inherited += 1;
    }
  }
  console.log(`${inherited} battle-only forms inherit their base learnset.`);

  // Collect every referenced move and fetch full metadata.
  const moveSlugs = new Set();
  for (const learnset of payloadByProfile.values()) {
    for (const methods of Object.values(learnset)) {
      for (const rows of Object.values(methods)) {
        for (const row of rows) {
          moveSlugs.add(row.move);
        }
      }
    }
  }

  console.log(`Fetching ${moveSlugs.size} moves...`);
  const moveRecords = await runWithConcurrency([...moveSlugs], 10, async (slug) => {
    const move = await fetchJson(`${API_BASE}/move/${slug}`);
    await delay(20);
    if (!move || !move.damage_class || move.pp == null) {
      return null;
    }

    const substituteChance = (text) =>
      text && move.effect_chance != null
        ? text.replaceAll("$effect_chance", String(move.effect_chance))
        : text;

    const fullEffect =
      substituteChance(pickEnglish(move.effect_entries, "effect")) ||
      "No effect text available.";
    const shortEffect =
      substituteChance(pickEnglish(move.effect_entries, "short_effect")) || fullEffect;

    return {
      slug,
      record: {
        name: pickEnglish(move.names, "name") || toDisplayName(slug),
        type: toDisplayName(move.type.name),
        category: toDisplayName(move.damage_class.name),
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        shortEffect,
        fullEffect,
        priority: move.priority,
      },
    };
  });

  const nameBySlug = new Map();
  const moves = [];
  for (const item of moveRecords) {
    if (!item) {
      continue;
    }
    nameBySlug.set(item.slug, item.record.name);
    moves.push(item.record);
  }
  moves.sort((a, b) => a.name.localeCompare(b.name));

  // Replace move slugs with display names and drop moves that were filtered
  // out of the master list (no damage class / pp, i.e. non-main-series).
  // Species introduction generation, from the base (formless) profile.
  const generationByDex = new Map();
  for (const entry of pokemon) {
    if (!entry.formName) {
      generationByDex.set(entry.nationalDexNumber, entry.generation);
    }
  }

  const learnsets = [];
  for (const entry of pokemon) {
    const raw = payloadByProfile.get(entry.profileKey);
    if (!raw || Object.keys(raw).length === 0) {
      continue;
    }
    const speciesGeneration = generationByDex.get(entry.nationalDexNumber) ?? 1;
    const learnset = {};
    for (const versionGroup of VERSION_GROUPS) {
      const methods = raw[versionGroup];
      if (!methods) {
        continue;
      }
      if (VERSION_GROUP_GENERATIONS.get(versionGroup) < speciesGeneration) {
        continue;
      }
      const cleaned = {};
      for (const [method, rows] of Object.entries(methods)) {
        // Compact tuples: [moveName, levelLearnedAt]. Level 0 means
        // "not level-based" (machine/egg/tutor) or "on evolution".
        const named = rows
          .filter((row) => nameBySlug.has(row.move))
          .map((row) => [nameBySlug.get(row.move), row.level]);
        if (named.length > 0) {
          cleaned[method] = named;
        }
      }
      if (Object.keys(cleaned).length > 0) {
        learnset[versionGroup] = cleaned;
      }
    }
    if (Object.keys(learnset).length > 0) {
      learnsets.push({ pokemonProfileKey: String(entry.profileKey), learnset });
    }
  }

  // Written compact (one profile per line): the file is machine-read only
  // and pretty-printing triples its size.
  await fs.writeFile(
    path.join(dataDir, "pokemonLearnsets.json"),
    `[\n${learnsets.map((entry) => JSON.stringify(entry)).join(",\n")}\n]\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(dataDir, "moves.json"),
    `${JSON.stringify(moves, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Wrote ${learnsets.length} learnsets and ${moves.length} moves.`,
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
