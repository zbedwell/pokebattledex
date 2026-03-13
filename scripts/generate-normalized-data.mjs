import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildEvolutionEdgeKey,
  buildEvolutionNodeKey,
  formatEvolutionDetails,
} from "../server/src/utils/evolutionLabels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = "https://pokeapi.co/api/v2";
const TYPE_IDS = Array.from({ length: 18 }, (_, index) => index + 1);

const SPECIAL_NAME_MAP = new Map([
  ["nidoran-f", "Nidoran F"],
  ["nidoran-m", "Nidoran M"],
  ["mr-mime", "Mr. Mime"],
  ["farfetchd", "Farfetch'd"],
]);

const LEARN_METHOD_PRIORITY = {
  level_up: 1,
  machine: 2,
  tutor: 3,
  egg: 4,
  other: 5,
};

const GENERATION_LABELS = {
  1: "Red/Blue",
  2: "Gold/Silver",
  3: "Ruby/Sapphire",
  4: "Diamond/Pearl",
  5: "Black/White",
  6: "X/Y",
  7: "Sun/Moon",
  8: "Sword/Shield",
  9: "Scarlet/Violet",
};

const GENERATION_VERSION_GROUP_PRIORITY = {
  1: ["red-blue", "yellow"],
  2: ["gold-silver", "crystal"],
  3: ["ruby-sapphire", "emerald", "firered-leafgreen"],
  4: ["diamond-pearl", "platinum", "heartgold-soulsilver"],
  5: ["black-white", "black-2-white-2"],
  6: ["x-y", "omega-ruby-alpha-sapphire"],
  7: ["sun-moon", "ultra-sun-ultra-moon", "lets-go-pikachu-lets-go-eevee"],
  8: ["sword-shield", "brilliant-diamond-and-shining-pearl", "legends-arceus"],
  9: ["scarlet-violet"],
};

const GAME_VERSION_SEQUENCE = [
  "red",
  "blue",
  "yellow",
  "gold",
  "silver",
  "crystal",
  "ruby",
  "sapphire",
  "emerald",
  "firered",
  "leafgreen",
  "diamond",
  "pearl",
  "platinum",
  "heartgold",
  "soulsilver",
  "black",
  "white",
  "black-2",
  "white-2",
  "x",
  "y",
  "omega-ruby",
  "alpha-sapphire",
  "sun",
  "moon",
  "ultra-sun",
  "ultra-moon",
  "lets-go-pikachu",
  "lets-go-eevee",
  "sword",
  "shield",
  "brilliant-diamond",
  "shining-pearl",
  "legends-arceus",
  "legends-z-a",
  "scarlet",
  "violet",
];

const GAME_VERSION_ORDER = new Map(
  GAME_VERSION_SEQUENCE.map((versionSlug, index) => [versionSlug, index]),
);

const GAME_NAME_OVERRIDES = new Map([
  ["firered", "FireRed"],
  ["leafgreen", "LeafGreen"],
  ["heartgold", "HeartGold"],
  ["soulsilver", "SoulSilver"],
  ["omega-ruby", "Omega Ruby"],
  ["alpha-sapphire", "Alpha Sapphire"],
  ["lets-go-pikachu", "Let's Go Pikachu"],
  ["lets-go-eevee", "Let's Go Eevee"],
  ["legends-arceus", "Legends: Arceus"],
  ["legends-z-a", "Legends: Z-A"],
]);

const ENCOUNTER_METHOD_LABELS = new Map([
  ["walk", "Grass/Cave Walk"],
  ["old-rod", "Fishing (Old Rod)"],
  ["good-rod", "Fishing (Good Rod)"],
  ["super-rod", "Fishing (Super Rod)"],
  ["surf", "Surf"],
  ["gift", "Gift"],
  ["trade", "Trade"],
  ["only-one", "Static Encounter"],
]);

const MODERN_DEX_FALLBACK_SOURCES = [
  {
    pokedexSlug: "letsgo-kanto",
    versionSlugs: ["lets-go-pikachu", "lets-go-eevee"],
    locationLabel: "Kanto Dex",
    methodLabel: "Regional Dex",
  },
  {
    pokedexSlug: "galar",
    versionSlugs: ["sword", "shield"],
    locationLabel: "Galar Dex",
    methodLabel: "Regional Dex",
  },
  {
    pokedexSlug: "isle-of-armor",
    versionSlugs: ["sword", "shield"],
    locationLabel: "Isle of Armor Dex",
    methodLabel: "DLC Dex",
  },
  {
    pokedexSlug: "crown-tundra",
    versionSlugs: ["sword", "shield"],
    locationLabel: "Crown Tundra Dex",
    methodLabel: "DLC Dex",
  },
  {
    pokedexSlug: "original-sinnoh",
    versionSlugs: ["brilliant-diamond", "shining-pearl"],
    locationLabel: "Sinnoh Dex",
    methodLabel: "Regional Dex",
  },
  {
    pokedexSlug: "hisui",
    versionSlugs: ["legends-arceus"],
    locationLabel: "Hisui Dex",
    methodLabel: "Regional Dex",
  },
  {
    pokedexSlug: "paldea",
    versionSlugs: ["scarlet", "violet"],
    locationLabel: "Paldea Dex",
    methodLabel: "Regional Dex",
  },
  {
    pokedexSlug: "kitakami",
    versionSlugs: ["scarlet", "violet"],
    locationLabel: "Kitakami Dex",
    methodLabel: "DLC Dex",
  },
  {
    pokedexSlug: "blueberry",
    versionSlugs: ["scarlet", "violet"],
    locationLabel: "Blueberry Dex",
    methodLabel: "DLC Dex",
  },
];

const MODERN_VERSION_GROUP_FALLBACK_SOURCES = [
  {
    versionGroupSlug: "sword-shield",
    versionSlugs: ["sword", "shield"],
    locationLabel: "Sword/Shield Game Data",
    methodLabel: "Game Compatibility",
  },
  {
    versionGroupSlug: "brilliant-diamond-shining-pearl",
    versionSlugs: ["brilliant-diamond", "shining-pearl"],
    locationLabel: "BDSP Game Data",
    methodLabel: "Game Compatibility",
  },
  {
    versionGroupSlug: "legends-arceus",
    versionSlugs: ["legends-arceus"],
    locationLabel: "Legends Arceus Game Data",
    methodLabel: "Game Compatibility",
  },
  {
    versionGroupSlug: "scarlet-violet",
    versionSlugs: ["scarlet", "violet"],
    locationLabel: "Scarlet/Violet Game Data",
    methodLabel: "Game Compatibility",
  },
];

const REGIONAL_FORM_RULES = [
  { token: "alola", label: "Alolan", introducedGeneration: 7 },
  { token: "galar", label: "Galarian", introducedGeneration: 8 },
  { token: "hisui", label: "Hisuian", introducedGeneration: 8 },
  { token: "paldea", label: "Paldean", introducedGeneration: 9 },
];
const BATTLE_ONLY_FORM_RULES = [
  { token: "mega", label: "Mega", kind: "mega", introducedGeneration: 6 },
  { token: "primal", label: "Primal", kind: "primal", introducedGeneration: 6 },
];
const BATTLE_ONLY_FORM_VERSION_SLUGS = [
  "x",
  "y",
  "omega-ruby",
  "alpha-sapphire",
  "sun",
  "moon",
  "ultra-sun",
  "ultra-moon",
  "lets-go-pikachu",
  "lets-go-eevee",
  "legends-z-a",
];
const BATTLE_TRANSFORMATION_LOCATION = "Battle Transformation";
const MEGA_REQUIREMENT_BY_SPECIES = new Map([
  ["abomasnow", "Abomasite"],
  ["absol", "Absolite"],
  ["aerodactyl", "Aerodactylite"],
  ["aggron", "Aggronite"],
  ["alakazam", "Alakazite"],
  ["altaria", "Altarianite"],
  ["ampharos", "Ampharosite"],
  ["audino", "Audinite"],
  ["banette", "Banettite"],
  ["beedrill", "Beedrillite"],
  ["blastoise", "Blastoisinite"],
  ["blaziken", "Blazikenite"],
  ["camerupt", "Cameruptite"],
  ["charizard", "Charizardite"],
  ["diancie", "Diancite"],
  ["gallade", "Galladite"],
  ["garchomp", "Garchompite"],
  ["gardevoir", "Gardevoirite"],
  ["gengar", "Gengarite"],
  ["glalie", "Glalitite"],
  ["gyarados", "Gyaradosite"],
  ["heracross", "Heracronite"],
  ["houndoom", "Houndoominite"],
  ["kangaskhan", "Kangaskhanite"],
  ["latias", "Latiasite"],
  ["latios", "Latiosite"],
  ["lopunny", "Lopunnite"],
  ["lucario", "Lucarionite"],
  ["manectric", "Manectite"],
  ["mawile", "Mawilite"],
  ["medicham", "Medichamite"],
  ["metagross", "Metagrossite"],
  ["mewtwo", "Mewtwonite"],
  ["pidgeot", "Pidgeotite"],
  ["pinsir", "Pinsirite"],
  ["rayquaza", "Dragon Ascent"],
  ["sableye", "Sablenite"],
  ["salamence", "Salamencite"],
  ["sceptile", "Sceptilite"],
  ["scizor", "Scizorite"],
  ["sharpedo", "Sharpedonite"],
  ["slowbro", "Slowbronite"],
  ["steelix", "Steelixite"],
  ["swampert", "Swampertite"],
  ["tyranitar", "Tyranitarite"],
  ["venusaur", "Venusaurite"],
]);
const PRIMAL_REQUIREMENT_BY_SPECIES = new Map([
  ["groudon", "Red Orb"],
  ["kyogre", "Blue Orb"],
]);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const LOCATION_SORT_COLLATOR = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

const toAsciiText = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  return String(value)
    .replaceAll("×", "x")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("’", "'")
    .replaceAll("“", "\"")
    .replaceAll("”", "\"")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
};

const parseTrailingId = (url) => {
  if (!url) {
    return NaN;
  }

  const value = String(url).replace(/\/+$/, "").split("/").pop();
  return Number(value);
};

const parseRegionalVariantInfo = (slug) => {
  const value = String(slug || "").toLowerCase();
  for (const rule of REGIONAL_FORM_RULES) {
    const marker = `-${rule.token}`;
    if (!value.includes(marker)) {
      continue;
    }

    const [, ...suffixParts] = value.split(marker);
    const suffix = suffixParts.join(marker).replace(/^-+/, "");
    const suffixLabel = suffix ? toDisplayName(suffix).replaceAll(" ", " ").trim() : "";
    const formName = suffixLabel ? `${rule.label} (${suffixLabel})` : rule.label;

    return {
      isRegional: true,
      formName,
      introducedGeneration: rule.introducedGeneration,
      token: rule.token,
    };
  }

  return {
    isRegional: false,
    formName: null,
    introducedGeneration: null,
    token: null,
  };
};

const parseBattleOnlyFormInfo = (speciesSlug, slug) => {
  const normalizedSpecies = String(speciesSlug || "").toLowerCase();
  const normalizedSlug = String(slug || "").toLowerCase();

  for (const rule of BATTLE_ONLY_FORM_RULES) {
    const expectedPrefix = `${normalizedSpecies}-${rule.token}`;
    if (!normalizedSlug.startsWith(expectedPrefix)) {
      continue;
    }

    const suffix = normalizedSlug.slice(expectedPrefix.length).replace(/^-+/, "");
    const suffixLabel = suffix ? toDisplayName(suffix).trim() : "";
    const formName = suffixLabel ? `${rule.label} ${suffixLabel}` : rule.label;

    return {
      isBattleOnlyForm: true,
      formName,
      introducedGeneration: rule.introducedGeneration,
      kind: rule.kind,
      expectedPrefix,
    };
  }

  return {
    isBattleOnlyForm: false,
    formName: null,
    introducedGeneration: null,
    kind: null,
    expectedPrefix: null,
  };
};

const resolveMegaRequirementText = ({ speciesSlug, pokemonSlug }) => {
  const normalizedSpecies = String(speciesSlug || "").toLowerCase();
  const normalizedSlug = String(pokemonSlug || "").toLowerCase();
  const baseRequirement = MEGA_REQUIREMENT_BY_SPECIES.get(normalizedSpecies) || "Mega Stone";

  if (baseRequirement === "Dragon Ascent") {
    return baseRequirement;
  }

  const megaPrefix = `${normalizedSpecies}-mega`;
  if (!normalizedSlug.startsWith(megaPrefix)) {
    return baseRequirement;
  }

  const suffix = normalizedSlug.slice(megaPrefix.length).replace(/^-+/, "");
  if (suffix === "x" || suffix === "y") {
    return `${baseRequirement} ${suffix.toUpperCase()}`;
  }

  return baseRequirement;
};

const resolvePrimalRequirementText = ({ speciesSlug }) => {
  const normalizedSpecies = String(speciesSlug || "").toLowerCase();
  return PRIMAL_REQUIREMENT_BY_SPECIES.get(normalizedSpecies) || "Primal Orb";
};

const toDisplayName = (slug) => {
  if (SPECIAL_NAME_MAP.has(slug)) {
    return SPECIAL_NAME_MAP.get(slug);
  }

  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const toDisplayGameName = (slug) => {
  if (GAME_NAME_OVERRIDES.has(slug)) {
    return GAME_NAME_OVERRIDES.get(slug);
  }

  return toDisplayName(slug);
};

const toDisplayLocationName = (slug) => {
  if (!slug) {
    return "Unknown Location";
  }

  const normalized = String(slug).endsWith("-area") ? String(slug).slice(0, -5) : String(slug);
  return toDisplayName(normalized);
};

const toDisplayEncounterMethod = (slug) => {
  if (!slug) {
    return "Encounter";
  }

  return ENCOUNTER_METHOD_LABELS.get(slug) || toDisplayName(slug);
};

const parseLocationSortHint = (locationName) => {
  const value = String(locationName || "").trim();

  const routeMatch = value.match(/\b(?:Sea\s+)?Route\s+(\d+)\b/i);
  if (routeMatch) {
    return {
      kind: "route",
      number: Number(routeMatch[1]),
    };
  }

  const areaMatch = value.match(/\b(?:Area|Zone)\s+(\d+)\b/i);
  if (areaMatch) {
    return {
      kind: "area",
      number: Number(areaMatch[1]),
    };
  }

  return {
    kind: "name",
    number: Number.MAX_SAFE_INTEGER,
  };
};

const compareLocationNamesChronologically = (a, b) => {
  const aHint = parseLocationSortHint(a);
  const bHint = parseLocationSortHint(b);

  if (aHint.kind === bHint.kind && aHint.kind !== "name" && aHint.number !== bHint.number) {
    return aHint.number - bHint.number;
  }

  return LOCATION_SORT_COLLATOR.compare(String(a), String(b));
};

const pickEnglish = (entries, key) => {
  const english = entries?.find((entry) => entry.language?.name === "en");
  return toAsciiText(english?.[key] ?? null);
};

const fetchJson = async (url, retries = 3) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    await delay(250);
    return fetchJson(url, retries - 1);
  }
};

const runWithConcurrency = async (items, concurrency, worker) => {
  const results = [];
  let index = 0;

  const runners = Array.from({ length: concurrency }).map(async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  });

  await Promise.all(runners);
  return results;
};

const fetchAvailableGenerations = async () => {
  const payload = await fetchJson(`${API_BASE}/generation?limit=1000`);
  const generationIds = (payload.results || [])
    .map((entry) => parseTrailingId(entry.url))
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);

  if (generationIds.length === 0) {
    throw new Error("Unable to determine supported generations from PokeAPI.");
  }

  return generationIds;
};

const normalizeGenerationList = (args, availableGenerations) => {
  const supportedSet = new Set(availableGenerations);
  const maxSupportedGeneration = availableGenerations[availableGenerations.length - 1];
  const gensArg = args.find((arg) => arg.startsWith("--gens="));
  const maxGenArg = args.find((arg) => arg.startsWith("--max-gen="));

  if (!gensArg && !maxGenArg) {
    return [1];
  }

  if (gensArg) {
    const raw = gensArg.split("=")[1] || "";
    const values = new Set();

    for (const token of raw.split(",").map((value) => value.trim()).filter(Boolean)) {
      if (token.includes("-")) {
        const [startRaw, endRaw] = token.split("-");
        const start = Number(startRaw);
        const end = Number(endRaw);

        if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
          throw new Error(`Invalid generation range in --gens: "${token}"`);
        }

        for (let value = start; value <= end; value += 1) {
          values.add(value);
        }
      } else {
        const value = Number(token);
        if (!Number.isInteger(value)) {
          throw new Error(`Invalid generation value in --gens: "${token}"`);
        }
        values.add(value);
      }
    }

    const normalized = [...values].sort((a, b) => a - b);
    if (normalized.length === 0) {
      throw new Error("No generations provided in --gens.");
    }

    for (const generation of normalized) {
      if (!supportedSet.has(generation)) {
        throw new Error(`Generation ${generation} is not available in PokeAPI.`);
      }
    }

    return normalized;
  }

  const maxGenRaw = String(maxGenArg.split("=")[1] || "").trim().toLowerCase();
  if (maxGenRaw === "latest") {
    return availableGenerations;
  }

  const maxGen = Number(maxGenRaw);
  if (!Number.isInteger(maxGen) || maxGen < 1 || maxGen > maxSupportedGeneration) {
    throw new Error(`Invalid --max-gen value. Supported range is 1-${maxSupportedGeneration}, or "latest".`);
  }

  return availableGenerations.filter((generation) => generation <= maxGen);
};

const buildPokemonIndexForGenerations = async (generations) => {
  const generationPayloads = await runWithConcurrency(generations, 4, async (generation) => {
    const data = await fetchJson(`${API_BASE}/generation/${generation}`);
    await delay(35);
    return { generation, data };
  });

  const pokemonGenerationMap = new Map();

  for (const { generation, data } of generationPayloads) {
    for (const species of data.pokemon_species) {
      const dexNumber = parseTrailingId(species.url);
      if (!Number.isInteger(dexNumber)) {
        continue;
      }

      if (!pokemonGenerationMap.has(dexNumber)) {
        pokemonGenerationMap.set(dexNumber, generation);
      }
    }
  }

  const pokemonIds = [...pokemonGenerationMap.keys()].sort((a, b) => a - b);
  return { pokemonIds, pokemonGenerationMap };
};

const buildTypeData = async () => {
  console.log("Fetching type data...");

  const typePayloads = await runWithConcurrency(TYPE_IDS, 6, async (typeId) => {
    const data = await fetchJson(`${API_BASE}/type/${typeId}`);
    await delay(30);
    return data;
  });

  const types = typePayloads.map((type) => ({
    name: toDisplayName(type.name),
  }));

  const typeNameSet = new Set(types.map((type) => type.name));

  const typeEffectiveness = [];
  for (const attackingType of typePayloads) {
    const multiplierMap = new Map();

    for (const defendingName of typeNameSet) {
      multiplierMap.set(defendingName, 1);
    }

    for (const type of attackingType.damage_relations.double_damage_to) {
      multiplierMap.set(toDisplayName(type.name), 2);
    }

    for (const type of attackingType.damage_relations.half_damage_to) {
      multiplierMap.set(toDisplayName(type.name), 0.5);
    }

    for (const type of attackingType.damage_relations.no_damage_to) {
      multiplierMap.set(toDisplayName(type.name), 0);
    }

    for (const [defendingType, multiplier] of multiplierMap.entries()) {
      typeEffectiveness.push({
        attackingType: toDisplayName(attackingType.name),
        defendingType,
        multiplier,
      });
    }
  }

  return {
    types: types.sort((a, b) => a.name.localeCompare(b.name)),
    typeEffectiveness: typeEffectiveness.sort((a, b) => {
      if (a.attackingType === b.attackingType) {
        return a.defendingType.localeCompare(b.defendingType);
      }
      return a.attackingType.localeCompare(b.attackingType);
    }),
  };
};

const buildModernDexFallbackBySpecies = async () => {
  console.log("Fetching modern availability fallback from Pokedex resources...");

  const pokedexPayloads = await runWithConcurrency(MODERN_DEX_FALLBACK_SOURCES, 4, async (source) => {
    const data = await fetchJson(`${API_BASE}/pokedex/${source.pokedexSlug}`);
    await delay(25);
    return {
      source,
      data,
    };
  });

  const fallbackBySpecies = new Map();

  for (const { source, data } of pokedexPayloads) {
    for (const entry of data.pokemon_entries || []) {
      const speciesSlug = entry?.pokemon_species?.name;
      if (!speciesSlug) {
        continue;
      }

      const byVersion = fallbackBySpecies.get(speciesSlug) || new Map();

      for (const versionSlug of source.versionSlugs) {
        const byLocation = byVersion.get(versionSlug) || new Map();
        const methods = byLocation.get(source.locationLabel) || new Set();
        methods.add(source.methodLabel);
        byLocation.set(source.locationLabel, methods);
        byVersion.set(versionSlug, byLocation);
      }

      fallbackBySpecies.set(speciesSlug, byVersion);
    }
  }

  return fallbackBySpecies;
};

const cloneLocationMethodMap = (locationMap) => {
  const cloned = new Map();
  if (!(locationMap instanceof Map)) {
    return cloned;
  }

  for (const [locationName, methods] of locationMap.entries()) {
    if (!locationName || !(methods instanceof Set)) {
      continue;
    }

    cloned.set(locationName, new Set(methods));
  }

  return cloned;
};

const mergeFallbackByVersion = (primary = new Map(), secondary = new Map()) => {
  const merged = new Map();

  if (primary instanceof Map) {
    for (const [versionSlug, locationMap] of primary.entries()) {
      if (!versionSlug) {
        continue;
      }
      merged.set(versionSlug, cloneLocationMethodMap(locationMap));
    }
  }

  if (secondary instanceof Map) {
    for (const [versionSlug, locationMap] of secondary.entries()) {
      if (!versionSlug || merged.has(versionSlug)) {
        continue;
      }
      merged.set(versionSlug, cloneLocationMethodMap(locationMap));
    }
  }

  return merged;
};

const buildVersionGroupFallbackByVersion = (pokemonMoveEntries = []) => {
  const versionGroups = new Set();

  for (const moveEntry of pokemonMoveEntries || []) {
    for (const detail of moveEntry?.version_group_details || []) {
      const groupName = detail?.version_group?.name;
      if (groupName) {
        versionGroups.add(groupName);
      }
    }
  }

  const fallbackByVersion = new Map();

  for (const source of MODERN_VERSION_GROUP_FALLBACK_SOURCES) {
    if (!versionGroups.has(source.versionGroupSlug)) {
      continue;
    }

    for (const versionSlug of source.versionSlugs) {
      const byLocation = fallbackByVersion.get(versionSlug) || new Map();
      const methods = byLocation.get(source.locationLabel) || new Set();
      methods.add(source.methodLabel);
      byLocation.set(source.locationLabel, methods);
      fallbackByVersion.set(versionSlug, byLocation);
    }
  }

  return fallbackByVersion;
};

const selectNotableMoves = (pokemonMoveEntries, generation) => {
  const preferredGroups = GENERATION_VERSION_GROUP_PRIORITY[generation] ?? [];
  const versionGroupPriority = new Map(preferredGroups.map((group, index) => [group, index]));
  const notable = [];

  for (const entry of pokemonMoveEntries) {
    const prioritizedDetails = entry.version_group_details.filter((detail) =>
      versionGroupPriority.has(detail.version_group.name),
    );

    const details = (prioritizedDetails.length > 0 ? prioritizedDetails : entry.version_group_details).sort(
      (a, b) => {
        const versionA = versionGroupPriority.get(a.version_group.name) ?? Number.MAX_SAFE_INTEGER;
        const versionB = versionGroupPriority.get(b.version_group.name) ?? Number.MAX_SAFE_INTEGER;
        if (versionA !== versionB) {
          return versionA - versionB;
        }

        const methodA = LEARN_METHOD_PRIORITY[a.move_learn_method.name] ?? LEARN_METHOD_PRIORITY.other;
        const methodB = LEARN_METHOD_PRIORITY[b.move_learn_method.name] ?? LEARN_METHOD_PRIORITY.other;

        if (methodA !== methodB) {
          return methodA - methodB;
        }

        return a.level_learned_at - b.level_learned_at;
      },
    );

    if (details.length === 0) {
      continue;
    }

    const best = details[0];

    notable.push({
      slug: entry.move.name,
      learnMethod: best.move_learn_method.name,
      level: best.level_learned_at,
      priority: LEARN_METHOD_PRIORITY[best.move_learn_method.name] ?? LEARN_METHOD_PRIORITY.other,
    });
  }

  return notable
    .sort((a, b) => {
      if (a.priority === b.priority) {
        return a.level - b.level;
      }
      return a.priority - b.priority;
    })
    .slice(0, 14);
};

const buildObtainMethodsByGame = (encounterRows, dexFallbackByVersion = new Map()) => {
  const hasEncounterRows = Array.isArray(encounterRows) && encounterRows.length > 0;
  const hasDexFallback = dexFallbackByVersion instanceof Map && dexFallbackByVersion.size > 0;

  if (!hasEncounterRows && !hasDexFallback) {
    return [];
  }

  const locationsByVersion = new Map();

  if (hasEncounterRows) {
    for (const row of encounterRows) {
      const locationName = toDisplayLocationName(row?.location_area?.name);
      const versionDetails = Array.isArray(row?.version_details) ? row.version_details : [];
      for (const versionDetail of versionDetails) {
        const versionSlug = versionDetail?.version?.name;
        if (!versionSlug) {
          continue;
        }

        const locationMap = locationsByVersion.get(versionSlug) || new Map();
        const methods = locationMap.get(locationName) || new Set();
        const encounterDetails = Array.isArray(versionDetail?.encounter_details)
          ? versionDetail.encounter_details
          : [];

        for (const detail of encounterDetails) {
          const methodSlug = detail?.method?.name;
          if (!methodSlug) {
            continue;
          }

          methods.add(toDisplayEncounterMethod(methodSlug));
        }

        if (methods.size === 0) {
          methods.add("Encounter");
        }

        locationMap.set(locationName, methods);
        locationsByVersion.set(versionSlug, locationMap);
      }
    }
  }

  if (hasDexFallback) {
    for (const [versionSlug, locationFallbackMap] of dexFallbackByVersion.entries()) {
      if (!versionSlug || !(locationFallbackMap instanceof Map)) {
        continue;
      }

      // Preserve explicit encounter data when available; fallback is only for
      // version gaps where PokeAPI encounter coverage is missing.
      if (locationsByVersion.has(versionSlug)) {
        continue;
      }

      const locationMap = locationsByVersion.get(versionSlug) || new Map();

      for (const [locationName, fallbackMethods] of locationFallbackMap.entries()) {
        if (!locationName || !(fallbackMethods instanceof Set)) {
          continue;
        }

        const methods = locationMap.get(locationName) || new Set();
        for (const method of fallbackMethods) {
          if (typeof method === "string" && method.trim().length > 0) {
            methods.add(method.trim());
          }
        }
        if (methods.size > 0) {
          locationMap.set(locationName, methods);
        }
      }

      if (locationMap.size > 0) {
        locationsByVersion.set(versionSlug, locationMap);
      }
    }
  }

  return [...locationsByVersion.entries()]
    .map(([versionSlug, locationMap]) => {
      const locations = [...locationMap.entries()]
        .map(([location, methodSet]) => ({
          location,
          methods: [...methodSet].sort((a, b) => a.localeCompare(b)),
        }))
        .sort((a, b) => compareLocationNamesChronologically(a.location, b.location));

      const methods = [
        ...new Set(locations.flatMap((entry) => entry.methods)),
      ].sort((a, b) => a.localeCompare(b));

      return {
        versionSlug,
        game: toDisplayGameName(versionSlug),
        methods,
        locations,
      };
    })
    .sort((a, b) => {
      const orderA = GAME_VERSION_ORDER.has(a.versionSlug)
        ? GAME_VERSION_ORDER.get(a.versionSlug)
        : Number.MAX_SAFE_INTEGER;
      const orderB = GAME_VERSION_ORDER.has(b.versionSlug)
        ? GAME_VERSION_ORDER.get(b.versionSlug)
        : Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.game.localeCompare(b.game);
    })
    .map(({ game, methods, locations }) => ({ game, methods, locations }));
};

const buildBattleOnlyFormObtainMethodsByGame = (kind) => {
  const methodLabel = kind === "primal" ? "Primal Reversion" : "Mega Evolution";

  return BATTLE_ONLY_FORM_VERSION_SLUGS.map((versionSlug) => {
    const game = toDisplayGameName(versionSlug);

    return {
      game,
      methods: [methodLabel],
      locations: [
        {
          location: BATTLE_TRANSFORMATION_LOCATION,
          methods: [methodLabel],
        },
      ],
    };
  });
};

const buildPokemonData = async (generations) => {
  const { pokemonIds, pokemonGenerationMap } = await buildPokemonIndexForGenerations(generations);
  const modernDexFallbackBySpecies = await buildModernDexFallbackBySpecies();

  console.log(
    `Fetching Pokemon data for generations ${generations.join(", ")} (${pokemonIds.length} species)...`,
  );

  const speciesPayloads = await runWithConcurrency(pokemonIds, 8, async (pokemonId) => {
    const data = await fetchJson(`${API_BASE}/pokemon-species/${pokemonId}`);
    await delay(20);
    return data;
  });

  const selectedProfiles = [];
  const speciesProfileMap = new Map();
  const profileMetaMap = new Map();

  for (const species of speciesPayloads) {
    const speciesDex = Number(species.id);
    const speciesSlug = species.name;
    const baseName = toDisplayName(speciesSlug);
    const defaultVariety = species.varieties.find((entry) => entry.is_default) || species.varieties[0];
    const seenVarieties = new Set();

    const addVariety = (variety, isDefaultSelection, formInfo = null) => {
      if (!variety?.pokemon?.name || seenVarieties.has(variety.pokemon.name)) {
        return;
      }

      seenVarieties.add(variety.pokemon.name);

      const slug = variety.pokemon.name;
      const regionalInfo = formInfo?.regionalInfo || parseRegionalVariantInfo(slug);
      const battleFormInfo =
        formInfo?.battleFormInfo || parseBattleOnlyFormInfo(speciesSlug, slug);
      const isRegionalVariant = !isDefaultSelection && regionalInfo.isRegional;
      const isBattleOnlyForm = !isDefaultSelection && battleFormInfo.isBattleOnlyForm;
      const profileKey = isDefaultSelection ? String(speciesDex) : `${speciesDex}-${slug}`;
      const formName = isRegionalVariant
        ? regionalInfo.formName
        : isBattleOnlyForm
          ? battleFormInfo.formName
          : null;
      const displayName = formName ? `${baseName} (${formName})` : baseName;
      const generation = isRegionalVariant
        ? regionalInfo.introducedGeneration
        : isBattleOnlyForm
          ? battleFormInfo.introducedGeneration
          : pokemonGenerationMap.get(speciesDex) || null;

      selectedProfiles.push({
        speciesDex,
        speciesSlug,
        pokemonSlug: slug,
        pokemonUrl: variety.pokemon.url,
        profileKey,
        name: displayName,
        formName,
        isRegionalVariant,
        isBattleOnlyForm,
        battleFormKind: isBattleOnlyForm ? battleFormInfo.kind : null,
        generation,
        introducedInGame: generation ? GENERATION_LABELS[generation] || null : null,
      });

      profileMetaMap.set(profileKey, {
        profileKey,
        speciesDex,
        speciesSlug,
        pokemonSlug: slug,
        name: displayName,
        formName,
        isRegionalVariant,
        isBattleOnlyForm,
        battleFormKind: isBattleOnlyForm ? battleFormInfo.kind : null,
      });
    };

    addVariety(defaultVariety, true);

    for (const variety of species.varieties) {
      if (variety.is_default) {
        continue;
      }

      const slug = variety.pokemon.name;
      const regionalInfo = parseRegionalVariantInfo(slug);
      const battleFormInfo = parseBattleOnlyFormInfo(speciesSlug, slug);

      if (!regionalInfo.isRegional && !battleFormInfo.isBattleOnlyForm) {
        continue;
      }

      if (regionalInfo.isRegional) {
        const expectedPrefix = `${speciesSlug}-${regionalInfo.token}`;
        if (!slug.startsWith(expectedPrefix)) {
          continue;
        }
      }

      if (battleFormInfo.isBattleOnlyForm) {
        const expectedPrefix = battleFormInfo.expectedPrefix;
        if (!expectedPrefix || !slug.startsWith(expectedPrefix)) {
          continue;
        }
      }

      addVariety(variety, false, { regionalInfo, battleFormInfo });
    }

    speciesProfileMap.set(speciesSlug, {
      defaultProfileKey: String(speciesDex),
      profileKeys: selectedProfiles
        .filter((entry) => entry.speciesSlug === speciesSlug)
        .map((entry) => entry.profileKey),
    });
  }

  console.log(`Fetching profile payloads (${selectedProfiles.length})...`);
  const pokemonPayloads = await runWithConcurrency(selectedProfiles, 8, async (profile) => {
    const data = await fetchJson(profile.pokemonUrl);
    await delay(15);
    const encounters = data.location_area_encounters
      ? await fetchJson(data.location_area_encounters)
      : [];
    await delay(15);
    return { profile, data, encounters };
  });
  const payloadByProfileKey = new Map(
    pokemonPayloads.map(({ profile, data }) => [String(profile.profileKey), data]),
  );

  const pokemon = [];
  const pokemonAbilities = [];
  const pokemonMoves = [];

  for (const { profile, data, encounters } of pokemonPayloads) {
    const statLookup = Object.fromEntries(data.stats.map((stat) => [stat.stat.name, stat.base_stat]));
    const sortedTypes = [...data.types].sort((a, b) => a.slot - b.slot);
    const defaultProfileData = payloadByProfileKey.get(String(profile.speciesDex)) || null;
    const abilityEntries =
      data.abilities.length > 0
        ? data.abilities
        : profile.isBattleOnlyForm && Array.isArray(defaultProfileData?.abilities)
          ? defaultProfileData.abilities
          : [];
    const moveSourceEntries =
      profile.isBattleOnlyForm &&
      Array.isArray(defaultProfileData?.moves) &&
      defaultProfileData.moves.length > 0
        ? defaultProfileData.moves
        : data.moves;
    const moveGeneration = profile.isBattleOnlyForm
      ? pokemonGenerationMap.get(profile.speciesDex) || profile.generation
      : profile.generation || pokemonGenerationMap.get(profile.speciesDex);

    pokemon.push({
      profileKey: profile.profileKey,
      nationalDexNumber: profile.speciesDex,
      name: profile.name,
      formName: profile.formName,
      isRegionalVariant: profile.isRegionalVariant,
      primaryType: toDisplayName(sortedTypes[0].type.name),
      secondaryType: sortedTypes[1] ? toDisplayName(sortedTypes[1].type.name) : null,
      hp: statLookup.hp,
      attack: statLookup.attack,
      defense: statLookup.defense,
      specialAttack: statLookup["special-attack"],
      specialDefense: statLookup["special-defense"],
      speed: statLookup.speed,
      spriteUrl:
        data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default || null,
      generation: profile.generation,
      introducedInGame: profile.introducedInGame,
      descriptionShort: null,
      obtainMethodsByGame: profile.isBattleOnlyForm
        ? buildBattleOnlyFormObtainMethodsByGame(profile.battleFormKind)
        : buildObtainMethodsByGame(
            encounters,
            mergeFallbackByVersion(
              modernDexFallbackBySpecies.get(profile.speciesSlug) || new Map(),
              buildVersionGroupFallbackByVersion(data.moves),
            ),
          ),
    });

    for (const ability of abilityEntries) {
      pokemonAbilities.push({
        pokemonProfileKey: profile.profileKey,
        abilitySlug: ability.ability.name,
        abilityName: toDisplayName(ability.ability.name),
        slotType: ability.is_hidden ? "hidden" : ability.slot === 1 ? "primary" : "secondary",
      });
    }

    const notableMoves = selectNotableMoves(moveSourceEntries, moveGeneration);

    for (const move of notableMoves) {
      pokemonMoves.push({
        pokemonProfileKey: profile.profileKey,
        moveSlug: move.slug,
        moveName: toDisplayName(move.slug),
        learnMethod: move.learnMethod,
        isNotableBattleMove: true,
      });
    }
  }

  return {
    pokemon,
    pokemonAbilities,
    pokemonMoves,
    pokemonIds,
    speciesProfileMapEntries: [...speciesProfileMap.entries()],
    profileMetaEntries: [...profileMetaMap.entries()],
  };
};

const buildAbilitiesData = async (pokemonAbilities) => {
  const abilityBySlug = new Map();
  for (const entry of pokemonAbilities) {
    if (!abilityBySlug.has(entry.abilitySlug)) {
      abilityBySlug.set(entry.abilitySlug, entry.abilityName);
    }
  }

  const uniqueAbilities = [...abilityBySlug.entries()].map(([slug, name]) => ({ slug, name }));

  console.log(`Fetching ability details (${uniqueAbilities.length})...`);

  const abilities = await runWithConcurrency(uniqueAbilities, 6, async ({ slug, name }) => {
    const ability = await fetchJson(`${API_BASE}/ability/${slug}`);
    await delay(25);

    const fullEffect = pickEnglish(ability.effect_entries, "effect") || "No effect text available.";
    const shortEffect = pickEnglish(ability.effect_entries, "short_effect") || fullEffect;

    return {
      name,
      shortEffect,
      fullEffect,
      isBattleRelevant: ability.is_main_series,
    };
  });

  return abilities.sort((a, b) => a.name.localeCompare(b.name));
};

const buildMovesData = async (pokemonMoves) => {
  const moveBySlug = new Map();
  for (const entry of pokemonMoves) {
    if (!moveBySlug.has(entry.moveSlug)) {
      moveBySlug.set(entry.moveSlug, entry.moveName);
    }
  }

  const uniqueMoves = [...moveBySlug.entries()].map(([slug, name]) => ({ slug, name }));

  console.log(`Fetching move details (${uniqueMoves.length})...`);

  const moves = await runWithConcurrency(uniqueMoves, 8, async ({ slug, name }) => {
    const move = await fetchJson(`${API_BASE}/move/${slug}`);
    await delay(20);

    const fullEffect = pickEnglish(move.effect_entries, "effect") || "No effect text available.";
    const shortEffect = pickEnglish(move.effect_entries, "short_effect") || fullEffect;

    return {
      name,
      type: toDisplayName(move.type.name),
      category: toDisplayName(move.damage_class.name),
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      shortEffect,
      fullEffect,
      priority: move.priority,
    };
  });

  return moves.sort((a, b) => a.name.localeCompare(b.name));
};

const readEvolutionOverrides = async (outputDir) => {
  const overridesPath = path.join(outputDir, "evolutionLabelOverrides.json");

  try {
    const content = await fs.readFile(overridesPath, "utf8");
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const legacyFlatEdges =
        !parsed.edges && !parsed.nodes
          ? parsed
          : {};

      return {
        edges: {
          ...legacyFlatEdges,
          ...(parsed.edges && typeof parsed.edges === "object" && !Array.isArray(parsed.edges)
            ? parsed.edges
            : {}),
        },
        nodes:
          parsed.nodes && typeof parsed.nodes === "object" && !Array.isArray(parsed.nodes)
            ? parsed.nodes
            : {},
      };
    }

    return { edges: {}, nodes: {} };
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(overridesPath, "{\n  \"edges\": {},\n  \"nodes\": {}\n}\n", "utf8");
      return { edges: {}, nodes: {} };
    }

    throw error;
  }
};

const resolveEdgeOverride = (overrides, edgeKey, fallback, defaults = {}) => {
  const override = overrides.edges?.[edgeKey];
  const resolved = {
    label: fallback.label,
    tooltip: fallback.tooltip,
    fromProfileKey: defaults.fromProfileKey || null,
    toProfileKey: defaults.toProfileKey || null,
  };

  if (typeof override === "string") {
    resolved.label = override;
    return resolved;
  }

  if (override && typeof override === "object") {
    resolved.label = override.label || resolved.label;
    if (Object.prototype.hasOwnProperty.call(override, "tooltip")) {
      resolved.tooltip = override.tooltip;
    }
    if (typeof override.from_profile_key === "string" && override.from_profile_key.trim()) {
      resolved.fromProfileKey = override.from_profile_key.trim();
    }
    if (typeof override.to_profile_key === "string" && override.to_profile_key.trim()) {
      resolved.toProfileKey = override.to_profile_key.trim();
    }
    return resolved;
  }

  return resolved;
};

const resolveNodeOverride = (overrides, nodeKeys, fallbackName) => {
  const keys = Array.isArray(nodeKeys) ? nodeKeys : [nodeKeys];
  const key = keys.find((candidate) => Object.prototype.hasOwnProperty.call(overrides.nodes || {}, candidate));
  if (!key) {
    return fallbackName;
  }

  const override = overrides.nodes?.[key];

  if (typeof override === "string" && override.trim()) {
    return override.trim();
  }

  if (override && typeof override === "object") {
    if (typeof override.display_name === "string" && override.display_name.trim()) {
      return override.display_name.trim();
    }

    if (typeof override.name === "string" && override.name.trim()) {
      return override.name.trim();
    }
  }

  return fallbackName;
};

const buildEvolutionData = async ({
  pokemonIds,
  speciesProfileMapEntries,
  profileMetaEntries,
  outputDir,
}) => {
  const speciesProfileMap = new Map(speciesProfileMapEntries);
  const profileMetaMap = new Map(profileMetaEntries);
  const seededDexSet = new Set(pokemonIds);

  console.log(`Fetching species data for evolution chains (${pokemonIds.length})...`);

  const speciesPayloads = await runWithConcurrency(pokemonIds, 8, async (pokemonId) => {
    const data = await fetchJson(`${API_BASE}/pokemon-species/${pokemonId}`);
    await delay(20);
    return data;
  });

  const chainIds = [
    ...new Set(
      speciesPayloads
        .map((species) => parseTrailingId(species.evolution_chain?.url))
        .filter((id) => Number.isInteger(id)),
    ),
  ].sort((a, b) => a - b);

  console.log(`Fetching evolution chains (${chainIds.length})...`);

  const chainPayloads = await runWithConcurrency(chainIds, 6, async (chainId) => {
    const data = await fetchJson(`${API_BASE}/evolution-chain/${chainId}`);
    await delay(20);
    return data;
  });

  const overrides = await readEvolutionOverrides(outputDir);

  const evolutionFamilies = [];
  const evolutionNodes = [];
  const evolutionEdges = [];

  for (const chain of chainPayloads) {
    const sourceChainId = Number(chain.id);
    const nodesByDex = new Map();
    const edges = [];
    let nodeOrder = 0;
    let edgeOrder = 0;

    const visitNode = (
      node,
      rawDepth,
      pathKey,
      parentPokemonDex = null,
      parentProfileKey = null,
    ) => {
      const speciesSlug = node.species?.name;
      const speciesProfile = speciesProfileMap.get(speciesSlug);
      const defaultProfileKey = speciesProfile?.defaultProfileKey || null;
      const defaultMeta = defaultProfileKey ? profileMetaMap.get(defaultProfileKey) : null;
      const pokemonDex = defaultMeta?.speciesDex ?? null;
      const isSeededPokemon = Number.isInteger(pokemonDex) && seededDexSet.has(pokemonDex);

      if (isSeededPokemon && defaultProfileKey && !nodesByDex.has(defaultProfileKey)) {
        const nodeKey = buildEvolutionNodeKey(sourceChainId, defaultProfileKey);
        const fallbackNodeKey = buildEvolutionNodeKey(sourceChainId, pokemonDex);
        const displayName = resolveNodeOverride(
          overrides,
          [nodeKey, fallbackNodeKey],
          defaultMeta?.name || toDisplayName(speciesSlug),
        );

        nodesByDex.set(defaultProfileKey, {
          pokemonProfileKey: defaultProfileKey,
          pokemonDex,
          rawDepth,
          displayOrder: nodeOrder,
          pathKey,
          displayName,
          speciesSlug,
        });
        nodeOrder += 1;
      }

      if (isSeededPokemon && parentPokemonDex) {
        const fallbackLabel = formatEvolutionDetails(node.evolution_details || []);
        const edgeKey = buildEvolutionEdgeKey(sourceChainId, parentPokemonDex, pokemonDex);
        const resolved = resolveEdgeOverride(overrides, edgeKey, fallbackLabel, {
          fromProfileKey: parentProfileKey,
          toProfileKey: defaultProfileKey,
        });

        const fromProfileKey = resolved.fromProfileKey || parentProfileKey;
        const toProfileKey = resolved.toProfileKey || defaultProfileKey;

        if (fromProfileKey && toProfileKey) {
          edges.push({
            fromPokemonProfileKey: fromProfileKey,
            toPokemonProfileKey: toProfileKey,
            label: resolved.label,
            tooltip: resolved.tooltip,
            sortOrder: edgeOrder,
          });
          edgeOrder += 1;
        }
      }

      const nextParentDex = isSeededPokemon ? pokemonDex : null;
      const nextParentProfileKey = isSeededPokemon ? defaultProfileKey : null;

      (node.evolves_to || []).forEach((child, index) => {
        const childPath = pathKey ? `${pathKey}.${index + 1}` : `${index + 1}`;
        visitNode(child, rawDepth + 1, childPath, nextParentDex, nextParentProfileKey);
      });
    };

    visitNode(chain.chain, 0, "0", null, null);

    const addBattleOnlyTransformationEdges = () => {
      const defaultNodes = [...nodesByDex.values()].filter((node) => {
        const speciesProfile = speciesProfileMap.get(node.speciesSlug);
        return speciesProfile && speciesProfile.defaultProfileKey === node.pokemonProfileKey;
      });

      for (const defaultNode of defaultNodes) {
        const speciesProfile = speciesProfileMap.get(defaultNode.speciesSlug);
        if (!speciesProfile) {
          continue;
        }

        const battleFormMeta = (speciesProfile.profileKeys || [])
          .map((profileKey) => profileMetaMap.get(profileKey))
          .filter((meta) => meta?.isBattleOnlyForm);

        if (battleFormMeta.length === 0) {
          continue;
        }

        for (const battleMeta of battleFormMeta) {
          const profileKey = String(battleMeta.profileKey);
          if (nodesByDex.has(profileKey)) {
            continue;
          }

          const nodeKey = buildEvolutionNodeKey(sourceChainId, profileKey);
          const fallbackNodeKey = buildEvolutionNodeKey(sourceChainId, battleMeta.speciesDex);
          const displayName = resolveNodeOverride(
            overrides,
            [nodeKey, fallbackNodeKey],
            battleMeta.name,
          );

          nodesByDex.set(profileKey, {
            pokemonProfileKey: profileKey,
            pokemonDex: battleMeta.speciesDex,
            rawDepth: Number(defaultNode.rawDepth) + 1,
            displayOrder: nodeOrder,
            pathKey: `${defaultNode.pathKey}.battle.${nodeOrder}`,
            displayName,
            speciesSlug: battleMeta.speciesSlug,
          });
          nodeOrder += 1;

          const requirement =
            battleMeta.battleFormKind === "primal"
              ? resolvePrimalRequirementText({
                  speciesSlug: battleMeta.speciesSlug,
                })
              : resolveMegaRequirementText({
                  speciesSlug: battleMeta.speciesSlug,
                  pokemonSlug: battleMeta.pokemonSlug,
                });
          const label =
            battleMeta.battleFormKind === "primal"
              ? `Primal Reversion (${requirement})`
              : `Mega Evolution (${requirement})`;

          edges.push({
            fromPokemonProfileKey: String(defaultNode.pokemonProfileKey),
            toPokemonProfileKey: profileKey,
            label,
            tooltip: label,
            sortOrder: edgeOrder,
          });
          edgeOrder += 1;
        }
      }
    };

    addBattleOnlyTransformationEdges();

    for (const edge of edges) {
      const addMissingProfileNode = (profileKey) => {
        if (!profileKey || nodesByDex.has(profileKey)) {
          return;
        }

        const meta = profileMetaMap.get(profileKey);
        if (!meta) {
          return;
        }

        const siblingNode = [...nodesByDex.values()].find((node) => node.speciesSlug === meta.speciesSlug);
        const rawDepth = siblingNode ? siblingNode.rawDepth : 0;
        const nodeKey = buildEvolutionNodeKey(sourceChainId, profileKey);
        const fallbackNodeKey = buildEvolutionNodeKey(sourceChainId, meta.speciesDex);
        const displayName = resolveNodeOverride(
          overrides,
          [nodeKey, fallbackNodeKey],
          meta.name,
        );

        nodesByDex.set(profileKey, {
          pokemonProfileKey: profileKey,
          pokemonDex: meta.speciesDex,
          rawDepth,
          displayOrder: nodeOrder,
          pathKey: "0",
          displayName,
          speciesSlug: meta.speciesSlug,
        });
        nodeOrder += 1;
      };

      addMissingProfileNode(edge.fromPokemonProfileKey);
      addMissingProfileNode(edge.toPokemonProfileKey);
    }

    const incidentProfiles = new Set();
    for (const edge of edges) {
      incidentProfiles.add(edge.fromPokemonProfileKey);
      incidentProfiles.add(edge.toPokemonProfileKey);
    }

    for (const [profileKey, node] of [...nodesByDex.entries()]) {
      const hasIncidentEdge = incidentProfiles.has(profileKey);
      if (hasIncidentEdge) {
        continue;
      }

      const siblingWithIncident = [...nodesByDex.entries()].some(
        ([otherProfileKey, otherNode]) =>
          otherProfileKey !== profileKey &&
          otherNode.speciesSlug === node.speciesSlug &&
          incidentProfiles.has(otherProfileKey),
      );

      if (siblingWithIncident) {
        nodesByDex.delete(profileKey);
      }
    }

    const rawNodes = [...nodesByDex.values()];
    if (rawNodes.length === 0) {
      continue;
    }

    const depthMap = new Map(
      [...new Set(rawNodes.map((node) => node.rawDepth))]
        .sort((a, b) => a - b)
        .map((depth, index) => [depth, index]),
    );

    const normalizedNodes = rawNodes
      .sort((a, b) => a.rawDepth - b.rawDepth || a.displayOrder - b.displayOrder)
      .map((node) => ({
        sourceChainId,
        pokemonProfileKey: node.pokemonProfileKey,
        depth: depthMap.get(node.rawDepth),
        displayOrder: node.displayOrder,
        pathKey: node.pathKey,
        displayName: node.displayName || null,
      }));

    const uniqueEdges = [
      ...new Map(
        edges.map((edge) => [
          `${edge.fromPokemonProfileKey}-${edge.toPokemonProfileKey}`,
          {
            sourceChainId,
            fromPokemonProfileKey: edge.fromPokemonProfileKey,
            toPokemonProfileKey: edge.toPokemonProfileKey,
            label: edge.label,
            tooltip: edge.tooltip,
            sortOrder: edge.sortOrder,
          },
        ]),
      ).values(),
    ].sort((a, b) => a.sortOrder - b.sortOrder);

    const outgoingCounts = new Map();
    for (const edge of uniqueEdges) {
      outgoingCounts.set(
        edge.fromPokemonProfileKey,
        (outgoingCounts.get(edge.fromPokemonProfileKey) || 0) + 1,
      );
    }

    evolutionFamilies.push({
      sourceChainId,
      isBranched: [...outgoingCounts.values()].some((count) => count > 1),
    });
    evolutionNodes.push(...normalizedNodes);
    evolutionEdges.push(...uniqueEdges);
  }

  evolutionFamilies.sort((a, b) => a.sourceChainId - b.sourceChainId);
  evolutionNodes.sort(
    (a, b) =>
      a.sourceChainId - b.sourceChainId || a.depth - b.depth || a.displayOrder - b.displayOrder,
  );
  evolutionEdges.sort((a, b) => a.sourceChainId - b.sourceChainId || a.sortOrder - b.sortOrder);

  return {
    evolutionFamilies,
    evolutionNodes,
    evolutionEdges,
  };
};

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const main = async () => {
  const availableGenerations = await fetchAvailableGenerations();
  const generations = normalizeGenerationList(process.argv.slice(2), availableGenerations);
  console.log(`Generating normalized data for generations: ${generations.join(", ")}`);

  const outputDir = path.resolve(__dirname, "../data/normalized");
  await fs.mkdir(outputDir, { recursive: true });

  const { types, typeEffectiveness } = await buildTypeData();
  const {
    pokemon,
    pokemonAbilities,
    pokemonMoves,
    pokemonIds,
    speciesProfileMapEntries,
    profileMetaEntries,
  } = await buildPokemonData(generations);
  const abilities = await buildAbilitiesData(pokemonAbilities);
  const moves = await buildMovesData(pokemonMoves);
  const { evolutionFamilies, evolutionNodes, evolutionEdges } = await buildEvolutionData({
    pokemonIds,
    speciesProfileMapEntries,
    profileMetaEntries,
    outputDir,
  });

  await writeJson(path.join(outputDir, "types.json"), types);
  await writeJson(path.join(outputDir, "typeEffectiveness.json"), typeEffectiveness);
  await writeJson(path.join(outputDir, "pokemon.json"), pokemon);
  await writeJson(path.join(outputDir, "abilities.json"), abilities);
  await writeJson(path.join(outputDir, "moves.json"), moves);
  await writeJson(path.join(outputDir, "pokemonAbilities.json"), pokemonAbilities);
  await writeJson(path.join(outputDir, "pokemonMoves.json"), pokemonMoves);
  await writeJson(path.join(outputDir, "evolutionFamilies.json"), evolutionFamilies);
  await writeJson(path.join(outputDir, "evolutionNodes.json"), evolutionNodes);
  await writeJson(path.join(outputDir, "evolutionEdges.json"), evolutionEdges);

  console.log("Normalized data generated in data/normalized.");
};

main().catch((error) => {
  console.error("Failed to generate normalized data:", error);
  process.exit(1);
});
