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
const MAX_SUPPORTED_GENERATION = 9;

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

const REGIONAL_FORM_RULES = [
  { token: "alola", label: "Alolan", introducedGeneration: 7 },
  { token: "galar", label: "Galarian", introducedGeneration: 8 },
  { token: "hisui", label: "Hisuian", introducedGeneration: 8 },
  { token: "paldea", label: "Paldean", introducedGeneration: 9 },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const toDisplayName = (slug) => {
  if (SPECIAL_NAME_MAP.has(slug)) {
    return SPECIAL_NAME_MAP.get(slug);
  }

  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
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

const normalizeGenerationList = (args) => {
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
      if (generation < 1 || generation > MAX_SUPPORTED_GENERATION) {
        throw new Error(
          `Generation ${generation} is out of supported range (1-${MAX_SUPPORTED_GENERATION}).`,
        );
      }
    }

    return normalized;
  }

  const maxGen = Number(maxGenArg.split("=")[1]);
  if (!Number.isInteger(maxGen) || maxGen < 1 || maxGen > MAX_SUPPORTED_GENERATION) {
    throw new Error(`Invalid --max-gen value. Supported range is 1-${MAX_SUPPORTED_GENERATION}.`);
  }

  return Array.from({ length: maxGen }, (_, index) => index + 1);
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

const buildPokemonData = async (generations) => {
  const { pokemonIds, pokemonGenerationMap } = await buildPokemonIndexForGenerations(generations);

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

    const addVariety = (variety, isDefaultSelection) => {
      if (!variety?.pokemon?.name || seenVarieties.has(variety.pokemon.name)) {
        return;
      }

      seenVarieties.add(variety.pokemon.name);

      const slug = variety.pokemon.name;
      const regionalInfo = parseRegionalVariantInfo(slug);
      const isRegionalVariant = !isDefaultSelection && regionalInfo.isRegional;
      const profileKey = isDefaultSelection ? String(speciesDex) : `${speciesDex}-${slug}`;
      const formName = isRegionalVariant ? regionalInfo.formName : null;
      const displayName = isRegionalVariant ? `${baseName} (${formName})` : baseName;
      const generation = isRegionalVariant
        ? regionalInfo.introducedGeneration
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
        generation,
        introducedInGame: generation ? GENERATION_LABELS[generation] || null : null,
      });

      profileMetaMap.set(profileKey, {
        profileKey,
        speciesDex,
        speciesSlug,
        name: displayName,
      });
    };

    addVariety(defaultVariety, true);

    for (const variety of species.varieties) {
      if (variety.is_default) {
        continue;
      }

      const slug = variety.pokemon.name;
      const regionalInfo = parseRegionalVariantInfo(slug);
      if (!regionalInfo.isRegional) {
        continue;
      }

      const expectedPrefix = `${speciesSlug}-${regionalInfo.token}`;
      if (!slug.startsWith(expectedPrefix)) {
        continue;
      }

      addVariety(variety, false);
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
    await delay(20);
    return { profile, data };
  });

  const pokemon = [];
  const pokemonAbilities = [];
  const pokemonMoves = [];

  for (const { profile, data } of pokemonPayloads) {
    const statLookup = Object.fromEntries(data.stats.map((stat) => [stat.stat.name, stat.base_stat]));
    const sortedTypes = [...data.types].sort((a, b) => a.slot - b.slot);

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
    });

    for (const ability of data.abilities) {
      pokemonAbilities.push({
        pokemonProfileKey: profile.profileKey,
        abilitySlug: ability.ability.name,
        abilityName: toDisplayName(ability.ability.name),
        slotType: ability.is_hidden ? "hidden" : ability.slot === 1 ? "primary" : "secondary",
      });
    }

    const notableMoves = selectNotableMoves(
      data.moves,
      profile.generation || pokemonGenerationMap.get(profile.speciesDex),
    );

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
  const generations = normalizeGenerationList(process.argv.slice(2));
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
