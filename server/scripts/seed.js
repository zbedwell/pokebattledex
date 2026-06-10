import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDbConnection } from "../src/db/tunnelPool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rows per INSERT statement. Keeps parameter counts well under the
// 65535-parameter protocol limit (widest table is 19 columns).
const BATCH_SIZE = 500;

const readJson = async (name, fallback = null) => {
  const filePath = path.resolve(__dirname, `../../data/normalized/${name}.json`);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) {
      return fallback;
    }

    throw error;
  }
};

const calculateBaseStatTotal = (pokemon) =>
  pokemon.hp +
  pokemon.attack +
  pokemon.defense +
  pokemon.specialAttack +
  pokemon.specialDefense +
  pokemon.speed;

// Multi-row INSERT in chunks. `rows` is an array of value arrays matching
// `columns`. Returns all RETURNING rows when `returning` is set.
const batchInsert = async (
  client,
  { table, columns, rows, onConflict = "", returning = "", batchSize = BATCH_SIZE },
) => {
  const returned = [];

  for (let start = 0; start < rows.length; start += batchSize) {
    const chunk = rows.slice(start, start + batchSize);
    const values = [];
    const tuples = chunk.map((row, rowIndex) => {
      values.push(...row);
      const offset = rowIndex * columns.length;
      return `(${columns.map((_, colIndex) => `$${offset + colIndex + 1}`).join(", ")})`;
    });

    const result = await client.query(
      `
        INSERT INTO ${table} (${columns.join(", ")})
        VALUES ${tuples.join(", ")}
        ${onConflict}
        ${returning ? `RETURNING ${returning}` : ""}
      `,
      values,
    );

    returned.push(...result.rows);
  }

  return returned;
};

// A single statement may not touch the same conflict key twice, so collapse
// duplicates ahead of time. `lastWins` mirrors ON CONFLICT DO UPDATE
// (the final occurrence applies); first-wins mirrors DO NOTHING.
const dedupeByKey = (rows, keyOf, { lastWins }) => {
  const map = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (lastWins || !map.has(key)) {
      map.set(key, row);
    }
  }
  return [...map.values()];
};

const seed = async () => {
  const db = await getDbConnection();
  const client = await db.pool.connect();

  try {
    const [
      types,
      typeEffectiveness,
      pokemon,
      abilities,
      moves,
      pokemonAbilities,
      pokemonMoves,
      evolutionFamilies,
      evolutionNodes,
      evolutionEdges,
      pokemonLearnsets,
    ] =
      await Promise.all([
        readJson("types"),
        readJson("typeEffectiveness"),
        readJson("pokemon"),
        readJson("abilities"),
        readJson("moves"),
        readJson("pokemonAbilities"),
        readJson("pokemonMoves"),
        readJson("evolutionFamilies", []),
        readJson("evolutionNodes", []),
        readJson("evolutionEdges", []),
        readJson("pokemonLearnsets", []),
      ]);

    await client.query("BEGIN");

    await client.query(`
      TRUNCATE TABLE
        battleex.pokemon_learnsets,
        battleex.evolution_edges,
        battleex.evolution_nodes,
        battleex.evolution_families,
        battleex.type_effectiveness,
        battleex.pokemon_moves,
        battleex.pokemon_abilities,
        battleex.moves,
        battleex.abilities,
        battleex.pokemon,
        battleex.types
      RESTART IDENTITY CASCADE
    `);

    const typeMap = new Map();
    for (const row of await batchInsert(client, {
      table: "battleex.types",
      columns: ["name"],
      rows: types.map((type) => [type.name]),
      returning: "id, name",
    })) {
      typeMap.set(row.name, row.id);
    }

    await batchInsert(client, {
      table: "battleex.type_effectiveness",
      columns: ["attacking_type_id", "defending_type_id", "multiplier"],
      rows: typeEffectiveness.map((entry) => [
        typeMap.get(entry.attackingType),
        typeMap.get(entry.defendingType),
        entry.multiplier,
      ]),
    });

    const pokemonMap = new Map();
    for (const row of await batchInsert(client, {
      table: "battleex.pokemon",
      columns: [
        "profile_key",
        "national_dex_number",
        "name",
        "form_name",
        "is_regional_variant",
        "primary_type_id",
        "secondary_type_id",
        "hp",
        "attack",
        "defense",
        "special_attack",
        "special_defense",
        "speed",
        "base_stat_total",
        "sprite_url",
        "description_short",
        "generation",
        "introduced_in_game",
        "obtain_methods",
      ],
      rows: pokemon.map((entry) => [
        String(entry.profileKey ?? entry.nationalDexNumber),
        entry.nationalDexNumber,
        entry.name,
        entry.formName || null,
        Boolean(entry.isRegionalVariant),
        typeMap.get(entry.primaryType),
        entry.secondaryType ? typeMap.get(entry.secondaryType) : null,
        entry.hp,
        entry.attack,
        entry.defense,
        entry.specialAttack,
        entry.specialDefense,
        entry.speed,
        calculateBaseStatTotal(entry),
        entry.spriteUrl,
        entry.descriptionShort,
        entry.generation,
        entry.introducedInGame,
        JSON.stringify(entry.obtainMethodsByGame ?? []),
      ]),
      returning: "id, profile_key",
    })) {
      pokemonMap.set(row.profile_key, row.id);
    }

    const abilityMap = new Map();
    for (const row of await batchInsert(client, {
      table: "battleex.abilities",
      columns: ["name", "short_effect", "full_effect", "is_battle_relevant"],
      rows: abilities.map((ability) => [
        ability.name,
        ability.shortEffect,
        ability.fullEffect,
        ability.isBattleRelevant,
      ]),
      returning: "id, name",
    })) {
      abilityMap.set(row.name, row.id);
    }

    const moveMap = new Map();
    for (const row of await batchInsert(client, {
      table: "battleex.moves",
      columns: [
        "name",
        "type_id",
        "category",
        "power",
        "accuracy",
        "pp",
        "short_effect",
        "full_effect",
        "priority",
      ],
      rows: moves.map((move) => [
        move.name,
        typeMap.get(move.type),
        move.category,
        move.power,
        move.accuracy,
        move.pp,
        move.shortEffect,
        move.fullEffect,
        move.priority,
      ]),
      returning: "id, name",
    })) {
      moveMap.set(row.name, row.id);
    }

    const evolutionFamilyMap = new Map();
    for (const row of await batchInsert(client, {
      table: "battleex.evolution_families",
      columns: ["source_chain_id", "is_branched"],
      rows: evolutionFamilies.map((family) => [
        family.sourceChainId,
        Boolean(family.isBranched),
      ]),
      returning: "id, source_chain_id",
    })) {
      evolutionFamilyMap.set(row.source_chain_id, row.id);
    }

    const nodeRows = evolutionNodes
      .map((node) => {
        const familyId = evolutionFamilyMap.get(node.sourceChainId);
        const pokemonId = pokemonMap.get(String(node.pokemonProfileKey));
        if (!familyId || !pokemonId) {
          return null;
        }
        return [
          familyId,
          pokemonId,
          node.depth,
          node.displayOrder,
          node.pathKey || null,
          node.displayName || null,
        ];
      })
      .filter(Boolean);
    await batchInsert(client, {
      table: "battleex.evolution_nodes",
      columns: ["family_id", "pokemon_id", "depth", "display_order", "path_key", "display_name"],
      rows: dedupeByKey(nodeRows, (row) => `${row[0]}|${row[1]}`, { lastWins: true }),
      onConflict: `
        ON CONFLICT (family_id, pokemon_id)
        DO UPDATE SET
          depth = EXCLUDED.depth,
          display_order = EXCLUDED.display_order,
          path_key = EXCLUDED.path_key,
          display_name = EXCLUDED.display_name
      `,
    });

    const edgeRows = evolutionEdges
      .map((edge) => {
        const familyId = evolutionFamilyMap.get(edge.sourceChainId);
        const fromPokemonId = pokemonMap.get(String(edge.fromPokemonProfileKey));
        const toPokemonId = pokemonMap.get(String(edge.toPokemonProfileKey));
        if (!familyId || !fromPokemonId || !toPokemonId) {
          return null;
        }
        return [
          familyId,
          fromPokemonId,
          toPokemonId,
          edge.label,
          edge.tooltip || null,
          edge.sortOrder || 0,
        ];
      })
      .filter(Boolean);
    await batchInsert(client, {
      table: "battleex.evolution_edges",
      columns: ["family_id", "from_pokemon_id", "to_pokemon_id", "label", "tooltip", "sort_order"],
      rows: dedupeByKey(edgeRows, (row) => `${row[0]}|${row[1]}|${row[2]}`, { lastWins: true }),
      onConflict: `
        ON CONFLICT (family_id, from_pokemon_id, to_pokemon_id)
        DO UPDATE SET
          label = EXCLUDED.label,
          tooltip = EXCLUDED.tooltip,
          sort_order = EXCLUDED.sort_order
      `,
    });

    const abilityLinkRows = pokemonAbilities
      .map((link) => {
        const pokemonId = pokemonMap.get(String(link.pokemonProfileKey ?? link.pokemonDex));
        const abilityId = abilityMap.get(link.abilityName);
        if (!pokemonId || !abilityId) {
          return null;
        }
        return [pokemonId, abilityId, link.slotType];
      })
      .filter(Boolean);
    await batchInsert(client, {
      table: "battleex.pokemon_abilities",
      columns: ["pokemon_id", "ability_id", "slot_type"],
      rows: dedupeByKey(abilityLinkRows, (row) => row.join("|"), { lastWins: false }),
      onConflict: "ON CONFLICT DO NOTHING",
    });

    const moveLinkRows = pokemonMoves
      .map((link) => {
        const pokemonId = pokemonMap.get(String(link.pokemonProfileKey ?? link.pokemonDex));
        const moveId = moveMap.get(link.moveName);
        if (!pokemonId || !moveId) {
          return null;
        }
        return [pokemonId, moveId, link.learnMethod, Boolean(link.isNotableBattleMove)];
      })
      .filter(Boolean);
    await batchInsert(client, {
      table: "battleex.pokemon_moves",
      columns: ["pokemon_id", "move_id", "learn_method", "is_notable_battle_move"],
      rows: dedupeByKey(moveLinkRows, (row) => `${row[0]}|${row[1]}`, { lastWins: true }),
      onConflict: `
        ON CONFLICT (pokemon_id, move_id)
        DO UPDATE SET
          learn_method = EXCLUDED.learn_method,
          is_notable_battle_move = EXCLUDED.is_notable_battle_move
      `,
    });

    const learnsetRows = pokemonLearnsets
      .map((entry) => {
        const pokemonId = pokemonMap.get(String(entry.pokemonProfileKey));
        if (!pokemonId) {
          return null;
        }
        return [pokemonId, JSON.stringify(entry.learnset)];
      })
      .filter(Boolean);
    await batchInsert(client, {
      table: "battleex.pokemon_learnsets",
      columns: ["pokemon_id", "learnset"],
      rows: dedupeByKey(learnsetRows, (row) => row[0], { lastWins: true }),
      // JSONB payloads are large; keep statements modest.
      batchSize: 100,
    });

    await client.query("COMMIT");

    console.log("Seed completed successfully.");
    console.log(
      `Inserted ${pokemon.length} pokemon, ${moves.length} moves, ${abilities.length} abilities, ${types.length} types, ${evolutionFamilies.length} evolution families.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error);
    throw error;
  } finally {
    client.release();
    await db.close();
  }
};

seed().catch(() => {
  process.exit(1);
});
