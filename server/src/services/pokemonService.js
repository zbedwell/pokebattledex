import {
  deriveRoleTags,
  deriveStrengthSummary,
  deriveWeaknessSummary,
  rankSimilarPokemon,
} from "../utils/battleInsights.js";
import { badRequest, notFound } from "../utils/httpErrors.js";

const normalizeAbilities = (abilities) => {
  if (!abilities) return [];
  if (Array.isArray(abilities)) return abilities;

  try {
    return JSON.parse(abilities);
  } catch {
    return [];
  }
};

const normalizePokemon = (row) => ({
  ...row,
  national_dex_number: Number(row.national_dex_number),
  hp: Number(row.hp),
  attack: Number(row.attack),
  defense: Number(row.defense),
  special_attack: Number(row.special_attack),
  special_defense: Number(row.special_defense),
  speed: Number(row.speed),
  base_stat_total: Number(row.base_stat_total),
  abilities: normalizeAbilities(row.abilities),
});

const summarizeBattleProfile = (pokemon, tags, strengths, weaknesses) => {
  const role = tags[0] || "battle-ready option";
  const strengthsText = strengths.length > 0 ? strengths.slice(0, 2).join(" and ") : "balanced stats";
  const weaknessText = weaknesses.length > 0 ? weaknesses[0] : "few glaring weaknesses";

  return `${pokemon.name} is a ${role.toLowerCase()} with ${strengthsText.toLowerCase()}, but ${weaknessText.toLowerCase()}.`;
};

const sortPokemonRows = (rows, sort, order) => {
  const direction = order === "desc" ? -1 : 1;

  const comparator = (a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name) * direction;

    const valueA = Number(a[sort] ?? 0);
    const valueB = Number(b[sort] ?? 0);

    if (valueA === valueB) {
      return a.name.localeCompare(b.name);
    }

    return (valueA - valueB) * direction;
  };

  return [...rows].sort(comparator);
};

const intersection = (arrays) => {
  if (arrays.length === 0) return [];
  return arrays.reduce((acc, values) => acc.filter((value) => values.includes(value)));
};

const pickBy = (rows, scoreFn, mode = "max") => {
  return rows.reduce((best, current) => {
    const bestScore = scoreFn(best);
    const currentScore = scoreFn(current);

    if (mode === "min") {
      return currentScore < bestScore ? current : best;
    }

    return currentScore > bestScore ? current : best;
  }, rows[0]);
};

const EVOLUTION_LAYOUT = {
  orientation_hint_desktop: "horizontal",
  orientation_hint_mobile: "vertical",
};

const toEvolutionNode = (pokemon, currentPokemonId) => ({
  pokemon_id: Number(pokemon.id),
  name: pokemon.name,
  dex_number: Number(pokemon.national_dex_number),
  sprite_url: pokemon.sprite_url,
  types: [pokemon.primary_type, pokemon.secondary_type].filter(Boolean),
  is_current: Number(pokemon.id) === Number(currentPokemonId),
  depth: 0,
  display_order: 0,
});

const buildNoEvolutionLine = (pokemon, currentPokemonId) => ({
  family_id: null,
  is_branched: false,
  nodes: [toEvolutionNode(pokemon, currentPokemonId)],
  edges: [],
  no_evolutions: true,
  layout: EVOLUTION_LAYOUT,
});

const buildEvolutionUnavailable = () => ({
  family_id: null,
  is_branched: false,
  nodes: [],
  edges: [],
  evolution_unavailable: true,
  layout: EVOLUTION_LAYOUT,
});

const filterEvolutionComponentForCurrentPokemon = (nodes, edges, currentPokemonId) => {
  const currentId = Number(currentPokemonId);
  const nodeIds = new Set(nodes.map((node) => Number(node.pokemon_id)));

  if (!nodeIds.has(currentId)) {
    return {
      nodes,
      edges,
    };
  }

  const adjacency = new Map();
  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, new Set());
  }

  for (const edge of edges) {
    const fromId = Number(edge.from_pokemon_id);
    const toId = Number(edge.to_pokemon_id);

    if (!adjacency.has(fromId)) adjacency.set(fromId, new Set());
    if (!adjacency.has(toId)) adjacency.set(toId, new Set());

    adjacency.get(fromId).add(toId);
    adjacency.get(toId).add(fromId);
  }

  const visited = new Set([currentId]);
  const queue = [currentId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    for (const neighbor of adjacency.get(nodeId) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const filteredNodes = nodes.filter((node) => visited.has(Number(node.pokemon_id)));
  const filteredEdges = edges.filter(
    (edge) =>
      visited.has(Number(edge.from_pokemon_id)) && visited.has(Number(edge.to_pokemon_id)),
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
};

const normalizeEvolutionDepths = (nodes) => {
  const uniqueDepths = [...new Set(nodes.map((node) => Number(node.depth)))].sort((a, b) => a - b);
  const depthMap = new Map(uniqueDepths.map((depth, index) => [depth, index]));

  return nodes.map((node) => ({
    ...node,
    depth: depthMap.get(Number(node.depth)),
  }));
};

const isEvolutionSubgraphBranched = (edges) => {
  const outgoingCounts = new Map();
  for (const edge of edges) {
    const fromId = Number(edge.from_pokemon_id);
    outgoingCounts.set(fromId, (outgoingCounts.get(fromId) || 0) + 1);
  }

  return [...outgoingCounts.values()].some((count) => count > 1);
};

const REGIONAL_TOKENS = ["alola", "galar", "hisui", "paldea"];
const REGIONAL_VARIANT_TARGET_PROFILE_OVERRIDES = new Map([
  ["52-meowth-galar", "863"],
]);
const MANUAL_EVOLUTION_LINES = [
  {
    familyId: 7,
    nodes: [
      { profileKey: "19", depth: 0, displayOrder: 0 },
      { profileKey: "20", depth: 1, displayOrder: 1 },
      { profileKey: "19-rattata-alola", depth: 0, displayOrder: 2 },
      { profileKey: "20-raticate-alola", depth: 1, displayOrder: 3 },
    ],
    edges: [
      {
        fromProfileKey: "19",
        toProfileKey: "20",
        label: "Level 20",
        tooltip: "Level 20",
      },
      {
        fromProfileKey: "19-rattata-alola",
        toProfileKey: "20-raticate-alola",
        label: "Level 20 (Night)",
        tooltip: "Level 20 at night.",
      },
    ],
  },
  {
    familyId: 11,
    nodes: [
      { profileKey: "27", depth: 0, displayOrder: 0 },
      { profileKey: "28", depth: 1, displayOrder: 1 },
      { profileKey: "27-sandshrew-alola", depth: 0, displayOrder: 2 },
      { profileKey: "28-sandslash-alola", depth: 1, displayOrder: 3 },
    ],
    edges: [
      {
        fromProfileKey: "27",
        toProfileKey: "28",
        label: "Level 22",
        tooltip: "Level 22",
      },
      {
        fromProfileKey: "27-sandshrew-alola",
        toProfileKey: "28-sandslash-alola",
        label: "Use Ice Stone",
        tooltip: "Use Ice Stone",
      },
    ],
  },
  {
    familyId: 15,
    nodes: [
      { profileKey: "37", depth: 0, displayOrder: 0 },
      { profileKey: "38", depth: 1, displayOrder: 1 },
      { profileKey: "37-vulpix-alola", depth: 0, displayOrder: 2 },
      { profileKey: "38-ninetales-alola", depth: 1, displayOrder: 3 },
    ],
    edges: [
      {
        fromProfileKey: "37",
        toProfileKey: "38",
        label: "Use Fire Stone",
        tooltip: "Use Fire Stone",
      },
      {
        fromProfileKey: "37-vulpix-alola",
        toProfileKey: "38-ninetales-alola",
        label: "Use Ice Stone",
        tooltip: "Use Ice Stone",
      },
    ],
  },
  {
    familyId: 22,
    nodes: [
      { profileKey: "52", depth: 0, displayOrder: 0 },
      { profileKey: "53", depth: 1, displayOrder: 1 },
      { profileKey: "52-meowth-alola", depth: 0, displayOrder: 2 },
      { profileKey: "53-persian-alola", depth: 1, displayOrder: 3 },
      { profileKey: "52-meowth-galar", depth: 0, displayOrder: 4 },
      { profileKey: "863", depth: 1, displayOrder: 5 },
    ],
    edges: [
      {
        fromProfileKey: "52",
        toProfileKey: "53",
        label: "Level 28",
        tooltip: "Level 28",
      },
      {
        fromProfileKey: "52-meowth-alola",
        toProfileKey: "53-persian-alola",
        label: "Level up (High Friendship)",
        tooltip: "Level up with high friendship.",
      },
      {
        fromProfileKey: "52-meowth-galar",
        toProfileKey: "863",
        label: "Level 28",
        tooltip: "Level 28",
      },
    ],
  },
  {
    familyId: 33,
    nodes: [
      { profileKey: "79", depth: 0, displayOrder: 0 },
      { profileKey: "80", depth: 1, displayOrder: 1 },
      { profileKey: "199", depth: 1, displayOrder: 2 },
      { profileKey: "79-slowpoke-galar", depth: 0, displayOrder: 3 },
      { profileKey: "80-slowbro-galar", depth: 1, displayOrder: 4 },
      { profileKey: "199-slowking-galar", depth: 1, displayOrder: 5 },
    ],
    edges: [
      {
        fromProfileKey: "79",
        toProfileKey: "80",
        label: "Level 37",
        tooltip: "Level 37",
      },
      {
        fromProfileKey: "79",
        toProfileKey: "199",
        label: "Trade while holding Kings Rock",
        tooltip: "Trigger: Trade; hold Kings Rock",
      },
      {
        fromProfileKey: "79-slowpoke-galar",
        toProfileKey: "80-slowbro-galar",
        label: "Use Galarica Cuff",
        tooltip: "Use Galarica Cuff",
      },
      {
        fromProfileKey: "79-slowpoke-galar",
        toProfileKey: "199-slowking-galar",
        label: "Use Galarica Wreath",
        tooltip: "Use Galarica Wreath",
      },
    ],
  },
  {
    familyId: 96,
    nodes: [
      { profileKey: "194", depth: 0, displayOrder: 0 },
      { profileKey: "195", depth: 1, displayOrder: 1 },
      { profileKey: "194-wooper-paldea", depth: 0, displayOrder: 2 },
      { profileKey: "980", depth: 1, displayOrder: 3 },
    ],
    edges: [
      {
        fromProfileKey: "194",
        toProfileKey: "195",
        label: "Level 20",
        tooltip: "Level 20",
      },
      {
        fromProfileKey: "194-wooper-paldea",
        toProfileKey: "980",
        label: "Level 20",
        tooltip: "Level 20",
      },
    ],
  },
  {
    familyId: 106,
    nodes: [
      { profileKey: "211", depth: 0, displayOrder: 0 },
      { profileKey: "211-qwilfish-hisui", depth: 0, displayOrder: 1 },
      { profileKey: "904", depth: 1, displayOrder: 2 },
    ],
    edges: [
      {
        fromProfileKey: "211-qwilfish-hisui",
        toProfileKey: "904",
        label: "Use Barb Barrage 20 times, then level up",
        tooltip: "Use Barb Barrage 20 times, then level up.",
      },
    ],
  },
  {
    familyId: 109,
    nodes: [
      { profileKey: "215", depth: 0, displayOrder: 0 },
      { profileKey: "461", depth: 1, displayOrder: 1 },
      { profileKey: "215-sneasel-hisui", depth: 0, displayOrder: 2 },
      { profileKey: "903", depth: 1, displayOrder: 3 },
    ],
    edges: [
      {
        fromProfileKey: "215",
        toProfileKey: "461",
        label: "Level up (Hold Razor Claw, Night)",
        tooltip: "Level up at night while holding Razor Claw.",
      },
      {
        fromProfileKey: "215-sneasel-hisui",
        toProfileKey: "903",
        label: "Level up (Hold Razor Claw, Day)",
        tooltip: "Level up during day while holding Razor Claw.",
      },
    ],
  },
  {
    familyId: 282,
    nodes: [
      { profileKey: "554", depth: 0, displayOrder: 0 },
      { profileKey: "555", depth: 1, displayOrder: 1 },
      { profileKey: "554-darumaka-galar", depth: 0, displayOrder: 2 },
      { profileKey: "555-darmanitan-galar-standard", depth: 1, displayOrder: 3 },
    ],
    edges: [
      {
        fromProfileKey: "554",
        toProfileKey: "555",
        label: "Level 35",
        tooltip: "Level 35",
      },
      {
        fromProfileKey: "554-darumaka-galar",
        toProfileKey: "555-darmanitan-galar-standard",
        label: "Use Ice Stone",
        tooltip: "Use Ice Stone",
      },
    ],
  },
];
const MANUAL_EVOLUTION_LINES_BY_PROFILE = new Map();
for (const line of MANUAL_EVOLUTION_LINES) {
  for (const node of line.nodes) {
    MANUAL_EVOLUTION_LINES_BY_PROFILE.set(String(node.profileKey).toLowerCase(), line);
  }
}

const extractRegionalToken = (profileKey) => {
  if (!profileKey) return null;
  const value = String(profileKey).toLowerCase();
  return REGIONAL_TOKENS.find((token) => value.includes(`-${token}`)) ?? null;
};

const toEvolutionNodeShape = (row, currentPokemonId) => ({
  pokemon_id: Number(row.pokemon_id),
  name: row.name,
  dex_number: Number(row.dex_number),
  sprite_url: row.sprite_url,
  types: [row.primary_type, row.secondary_type].filter(Boolean),
  is_current: Number(row.pokemon_id) === Number(currentPokemonId),
  depth: Number(row.depth),
  display_order: Number(row.display_order),
});

const toEvolutionEdgeShape = (row) => ({
  from_pokemon_id: Number(row.from_pokemon_id),
  to_pokemon_id: Number(row.to_pokemon_id),
  label: row.label,
  tooltip: row.tooltip,
});

const toEvolutionNodeRow = (pokemon, depth, displayOrder = depth) => ({
  pokemon_id: Number(pokemon.id),
  name: pokemon.name,
  dex_number: Number(pokemon.national_dex_number),
  sprite_url: pokemon.sprite_url,
  primary_type: pokemon.primary_type,
  secondary_type: pokemon.secondary_type,
  depth: Number(depth),
  display_order: Number(displayOrder),
});

const buildEvolutionPayload = ({ family, nodeRows, edgeRows, pokemon }) => {
  const nodes = nodeRows.map((row) => toEvolutionNodeShape(row, pokemon.id));
  const edges = edgeRows.map(toEvolutionEdgeShape);

  const filtered = filterEvolutionComponentForCurrentPokemon(nodes, edges, pokemon.id);
  const normalizedNodes = normalizeEvolutionDepths(filtered.nodes);
  const isBranched = isEvolutionSubgraphBranched(filtered.edges);

  if (normalizedNodes.length === 0) {
    return buildNoEvolutionLine(pokemon, pokemon.id);
  }

  return {
    family_id: Number(family.source_chain_id),
    is_branched: isBranched,
    nodes: normalizedNodes,
    edges: filtered.edges,
    no_evolutions: normalizedNodes.length === 1 && filtered.edges.length === 0,
    layout: EVOLUTION_LAYOUT,
  };
};

export const createPokemonService = ({ pokemonRepository, typeService }) => {
  const hydratePokemon = async (pokemon) => {
    const types = [pokemon.primary_type, pokemon.secondary_type].filter(Boolean);
    const [defensiveMatchup, offensiveCoverage, abilities, moves] = await Promise.all([
      typeService.getDefensiveMatchup(types),
      typeService.getOffensiveCoverage(types),
      pokemonRepository.getPokemonAbilities(pokemon.id),
      pokemonRepository.getPokemonMoves(pokemon.id),
    ]);

    const roleTags = deriveRoleTags(pokemon);
    const strengths = deriveStrengthSummary(pokemon, defensiveMatchup, roleTags);
    const weaknesses = deriveWeaknessSummary(pokemon, defensiveMatchup);

    return {
      ...pokemon,
      abilities,
      role_tags: roleTags,
      strengths,
      weaknesses,
      battle_summary: summarizeBattleProfile(pokemon, roleTags, strengths, weaknesses),
      defensive_matchup: defensiveMatchup,
      offensive_stab_coverage: offensiveCoverage,
      notable_moves: moves.filter((move) => move.is_notable_battle_move).slice(0, 12),
      move_pool_preview: moves.slice(0, 20),
    };
  };

  const getEvolutionLine = async (pokemon) => {
    const resolveManualEvolutionLine = async () => {
      const profileKey = String(pokemon.profile_key || "").toLowerCase();
      const line = MANUAL_EVOLUTION_LINES_BY_PROFILE.get(profileKey);
      if (!line) {
        return null;
      }

      const requiredKeys = [
        ...new Set([
          ...line.nodes.map((node) => String(node.profileKey)),
          ...line.edges.flatMap((edge) => [String(edge.fromProfileKey), String(edge.toProfileKey)]),
        ]),
      ];

      const linePokemonRows = await Promise.all(
        requiredKeys.map((key) => pokemonRepository.getPokemonByProfileKey(key)),
      );

      if (linePokemonRows.some((row) => !row)) {
        return null;
      }

      const rowsByProfileKey = new Map(
        requiredKeys.map((key, index) => [String(key).toLowerCase(), linePokemonRows[index]]),
      );

      const nodeRows = line.nodes.map((node) =>
        toEvolutionNodeRow(
          rowsByProfileKey.get(String(node.profileKey).toLowerCase()),
          node.depth,
          node.displayOrder,
        ),
      );

      const edgeRows = line.edges.map((edge) => {
        const fromPokemon = rowsByProfileKey.get(String(edge.fromProfileKey).toLowerCase());
        const toPokemon = rowsByProfileKey.get(String(edge.toProfileKey).toLowerCase());

        return {
          from_pokemon_id: Number(fromPokemon.id),
          to_pokemon_id: Number(toPokemon.id),
          label: edge.label,
          tooltip: edge.tooltip ?? null,
        };
      });

      return buildEvolutionPayload({
        family: { source_chain_id: line.familyId },
        nodeRows,
        edgeRows,
        pokemon,
      });
    };

    try {
      const manualEvolutionLine = await resolveManualEvolutionLine();
      if (manualEvolutionLine) {
        return manualEvolutionLine;
      }

      const family = await pokemonRepository.getEvolutionFamilyByPokemonId(pokemon.id);
      if (family) {
        const [nodeRows, edgeRows] = await Promise.all([
          pokemonRepository.getEvolutionNodesByFamilyId(family.family_id),
          pokemonRepository.getEvolutionEdgesByFamilyId(family.family_id),
        ]);

        if (nodeRows.length > 0) {
          return buildEvolutionPayload({ family, nodeRows, edgeRows, pokemon });
        }
      }

      // Fallback for regional variants whose evolution rows were not persisted
      // as variant-specific edges (common for Alolan/Hisuian/Paldean forms).
      if (pokemon.is_regional_variant) {
        const regionalToken = extractRegionalToken(pokemon.profile_key);
        if (regionalToken) {
          const basePokemon = await pokemonRepository.getDefaultPokemonByDex(pokemon.national_dex_number);
          if (basePokemon) {
            const baseFamily = await pokemonRepository.getEvolutionFamilyByPokemonId(basePokemon.id);
            if (baseFamily) {
              const [baseNodes, baseEdges] = await Promise.all([
                pokemonRepository.getEvolutionNodesByFamilyId(baseFamily.family_id),
                pokemonRepository.getEvolutionEdgesByFamilyId(baseFamily.family_id),
              ]);

              if (baseNodes.length > 0) {
                const uniqueDexNumbers = [...new Set(baseNodes.map((row) => Number(row.dex_number)))];
                const regionalVariants = await pokemonRepository.getRegionalVariantsByDexAndToken(
                  uniqueDexNumbers,
                  regionalToken,
                );

                const variantsByDex = new Map();
                for (const variant of regionalVariants) {
                  const dex = Number(variant.national_dex_number);
                  if (!variantsByDex.has(dex)) {
                    variantsByDex.set(dex, variant);
                  }
                }

                const baseNodesById = new Map(
                  baseNodes.map((row) => [Number(row.pokemon_id), row]),
                );
                const currentBaseNode =
                  baseNodes.find(
                    (row) => Number(row.dex_number) === Number(pokemon.national_dex_number),
                  ) ?? null;

                // If the current regional form exists but its base-family outgoing target
                // has no matching regional replacement, we cannot safely infer the next stage.
                // Return no-evolution instead of showing an incorrect base-form evolution.
                if (currentBaseNode && variantsByDex.has(Number(currentBaseNode.dex_number))) {
                  const hasUnmappedOutgoingTarget = baseEdges
                    .filter(
                      (edge) =>
                        Number(edge.from_pokemon_id) === Number(currentBaseNode.pokemon_id),
                    )
                    .some((edge) => {
                      const targetNode = baseNodesById.get(Number(edge.to_pokemon_id));
                      return targetNode && !variantsByDex.has(Number(targetNode.dex_number));
                    });

                  if (hasUnmappedOutgoingTarget) {
                    const manualTargetProfileKey = REGIONAL_VARIANT_TARGET_PROFILE_OVERRIDES.get(
                      String(pokemon.profile_key || "").toLowerCase(),
                    );

                    if (manualTargetProfileKey) {
                      const manualTarget = await pokemonRepository.getPokemonByProfileKey(
                        manualTargetProfileKey,
                      );
                      if (manualTarget) {
                        const baseOutgoingEdge =
                          baseEdges.find(
                            (edge) =>
                              Number(edge.from_pokemon_id) === Number(currentBaseNode.pokemon_id),
                          ) ?? null;

                        return buildEvolutionPayload({
                          family: baseFamily,
                          nodeRows: [
                            toEvolutionNodeRow(pokemon, 0, 0),
                            toEvolutionNodeRow(manualTarget, 1, 1),
                          ],
                          edgeRows: [
                            {
                              from_pokemon_id: Number(pokemon.id),
                              to_pokemon_id: Number(manualTarget.id),
                              label: baseOutgoingEdge?.label || "Level up",
                              tooltip: baseOutgoingEdge?.tooltip || null,
                            },
                          ],
                          pokemon,
                        });
                      }
                    }

                    return buildNoEvolutionLine(pokemon, pokemon.id);
                  }
                }

                const mappedNodes = baseNodes.map((row) => {
                  const replacement = variantsByDex.get(Number(row.dex_number));
                  if (!replacement) {
                    return row;
                  }

                  return {
                    ...row,
                    pokemon_id: Number(replacement.id),
                    name: replacement.name,
                    sprite_url: replacement.sprite_url,
                    primary_type: replacement.primary_type,
                    secondary_type: replacement.secondary_type,
                  };
                });

                const nodeIdMap = new Map(
                  baseNodes.map((row, index) => [
                    Number(row.pokemon_id),
                    Number(mappedNodes[index]?.pokemon_id ?? row.pokemon_id),
                  ]),
                );

                const mappedEdges = baseEdges
                  .map((edge) => ({
                    ...edge,
                    from_pokemon_id:
                      nodeIdMap.get(Number(edge.from_pokemon_id)) ?? Number(edge.from_pokemon_id),
                    to_pokemon_id:
                      nodeIdMap.get(Number(edge.to_pokemon_id)) ?? Number(edge.to_pokemon_id),
                  }))
                  .filter((edge) => Number(edge.from_pokemon_id) !== Number(edge.to_pokemon_id));

                return buildEvolutionPayload({
                  family: baseFamily,
                  nodeRows: mappedNodes,
                  edgeRows: mappedEdges,
                  pokemon,
                });
              }
            }
          }
        }
      }

      return buildNoEvolutionLine(pokemon, pokemon.id);
    } catch (error) {
      console.error(`Failed to load evolution line for pokemon ${pokemon.id}:`, error);
      return buildEvolutionUnavailable();
    }
  };

  return {
    async listPokemonOptions({ q, limit }) {
      const rows = await pokemonRepository.searchPokemonOptions(q, limit);
      return rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        national_dex_number: Number(row.national_dex_number),
        sprite_url: row.sprite_url,
        primary_type: row.primary_type,
        secondary_type: row.secondary_type,
      }));
    },

    async listPokemon(filters) {
      const rows = await pokemonRepository.listPokemon(filters);
      let pokemon = rows.map(normalizePokemon).map((entry) => {
        const tags = deriveRoleTags(entry);
        const primaryAbilities = normalizeAbilities(entry.abilities)
          .sort((a, b) => a.slot_type.localeCompare(b.slot_type))
          .map((ability) => ability.name)
          .slice(0, 3);

        return {
          id: entry.id,
          national_dex_number: entry.national_dex_number,
          name: entry.name,
          sprite_url: entry.sprite_url,
          primary_type: entry.primary_type,
          secondary_type: entry.secondary_type,
          hp: entry.hp,
          attack: entry.attack,
          defense: entry.defense,
          special_attack: entry.special_attack,
          special_defense: entry.special_defense,
          speed: entry.speed,
          base_stat_total: entry.base_stat_total,
          primary_abilities: primaryAbilities,
          role_tags: tags,
          battle_tag: tags[0] ?? "Balanced Attacker",
        };
      });

      if (filters.tag) {
        const normalizedTag = filters.tag.toLowerCase();
        pokemon = pokemon.filter((entry) =>
          entry.role_tags.some((tag) => tag.toLowerCase().includes(normalizedTag)),
        );
      }

      const sorted = sortPokemonRows(pokemon, filters.sort, filters.order);

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const offset = (page - 1) * limit;
      const data = sorted.slice(offset, offset + limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total: sorted.length,
          total_pages: Math.max(1, Math.ceil(sorted.length / limit)),
        },
      };
    },

    async getPokemonDetail(identifier) {
      const row = await pokemonRepository.getPokemonByIdentifier(identifier);
      if (!row) {
        throw notFound("Pokemon not found.");
      }

      const pokemon = normalizePokemon(row);
      const hydrated = await hydratePokemon(pokemon);
      const evolutionLine = await getEvolutionLine(pokemon);

      const [allPokemonRows, abilityNameRows] = await Promise.all([
        pokemonRepository.listPokemon({}),
        pokemonRepository.listAbilityNamesByPokemon(),
      ]);

      const allPokemon = allPokemonRows.map(normalizePokemon);
      const abilityMap = new Map();
      for (const abilityRow of abilityNameRows) {
        const list = abilityMap.get(abilityRow.pokemon_id) ?? [];
        list.push(abilityRow.ability_name);
        abilityMap.set(abilityRow.pokemon_id, list);
      }

      const similar = rankSimilarPokemon({
        target: pokemon,
        candidates: allPokemon,
        getAbilities: (id) => abilityMap.get(id) ?? [],
        getTags: deriveRoleTags,
      }).map((entry) => ({
        id: entry.id,
        name: entry.name,
        sprite_url: entry.sprite_url,
        primary_type: entry.primary_type,
        secondary_type: entry.secondary_type,
        base_stat_total: entry.base_stat_total,
        role_tags: deriveRoleTags(entry),
      }));

      return {
        ...hydrated,
        evolution_line: evolutionLine,
        similar_pokemon: similar,
      };
    },

    async getPokemonEvolution(identifier) {
      const row = await pokemonRepository.getPokemonByIdentifier(identifier);
      if (!row) {
        throw notFound("Pokemon not found.");
      }

      const pokemon = normalizePokemon(row);
      return getEvolutionLine(pokemon);
    },

    async getPokemonMoves(identifier) {
      const pokemon = await pokemonRepository.getPokemonByIdentifier(identifier);
      if (!pokemon) {
        throw notFound("Pokemon not found.");
      }

      return {
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          national_dex_number: pokemon.national_dex_number,
        },
        moves: await pokemonRepository.getPokemonMoves(pokemon.id),
      };
    },

    async getPokemonAbilities(identifier) {
      const pokemon = await pokemonRepository.getPokemonByIdentifier(identifier);
      if (!pokemon) {
        throw notFound("Pokemon not found.");
      }

      return {
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          national_dex_number: pokemon.national_dex_number,
        },
        abilities: await pokemonRepository.getPokemonAbilities(pokemon.id),
      };
    },

    async comparePokemon(idsQuery) {
      const ids = idsQuery
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => Number(part));

      if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
        throw badRequest("Compare IDs must be numeric Pokemon IDs.");
      }

      const uniqueIds = [...new Set(ids)];
      if (uniqueIds.length !== ids.length) {
        throw badRequest("Duplicate Pokemon IDs are not allowed.");
      }

      if (uniqueIds.length < 2 || uniqueIds.length > 4) {
        throw badRequest("Compare accepts 2 to 4 Pokemon IDs.");
      }

      const rows = await pokemonRepository.getPokemonByIds(uniqueIds);
      const pokemonRows = rows.map(normalizePokemon);

      if (pokemonRows.length !== uniqueIds.length) {
        throw notFound("One or more Pokemon IDs were not found.");
      }

      const ordered = uniqueIds
        .map((id) => pokemonRows.find((entry) => entry.id === id))
        .filter(Boolean);

      const details = await Promise.all(
        ordered.map(async (pokemon) => {
          const hydrated = await hydratePokemon(pokemon);
          return {
            id: hydrated.id,
            national_dex_number: hydrated.national_dex_number,
            name: hydrated.name,
            sprite_url: hydrated.sprite_url,
            primary_type: hydrated.primary_type,
            secondary_type: hydrated.secondary_type,
            abilities: hydrated.abilities,
            stats: {
              hp: hydrated.hp,
              attack: hydrated.attack,
              defense: hydrated.defense,
              special_attack: hydrated.special_attack,
              special_defense: hydrated.special_defense,
              speed: hydrated.speed,
              base_stat_total: hydrated.base_stat_total,
            },
            role_tags: hydrated.role_tags,
            defensive_matchup: hydrated.defensive_matchup,
            notable_moves: hydrated.notable_moves.slice(0, 8),
            resistance_count:
              hydrated.defensive_matchup.resistances_half.length +
              hydrated.defensive_matchup.resistances_quarter.length +
              hydrated.defensive_matchup.immunities.length,
            weakness_count:
              hydrated.defensive_matchup.weaknesses_2x.length +
              hydrated.defensive_matchup.weaknesses_4x.length,
          };
        }),
      );

      const winners = {
        highest_speed: pickBy(details, (row) => row.stats.speed).name,
        highest_attack: pickBy(details, (row) => row.stats.attack).name,
        highest_special_attack: pickBy(details, (row) => row.stats.special_attack).name,
        highest_physical_bulk: pickBy(details, (row) => row.stats.hp + row.stats.defense).name,
        highest_special_bulk: pickBy(details, (row) => row.stats.hp + row.stats.special_defense).name,
        most_resistances: pickBy(details, (row) => row.resistance_count).name,
        fewest_weaknesses: pickBy(details, (row) => row.weakness_count, "min").name,
      };

      const sharedWeaknesses = intersection(
        details.map((entry) => [
          ...(entry.defensive_matchup.weaknesses_2x || []),
          ...(entry.defensive_matchup.weaknesses_4x || []),
        ]),
      );

      return {
        pokemon: details,
        highlights: {
          ...winners,
          stat_winners: {
            speed: winners.highest_speed,
            attack: winners.highest_attack,
            special_attack: winners.highest_special_attack,
            special_bulk: winners.highest_special_bulk,
            most_resistances: winners.most_resistances,
          },
          shared_weaknesses: sharedWeaknesses,
        },
      };
    },
  };
};
