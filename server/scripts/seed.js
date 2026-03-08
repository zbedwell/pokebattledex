import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDbConnection } from "../src/db/tunnelPool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      ]);

    await client.query("BEGIN");

    await client.query(`
      TRUNCATE TABLE
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
    for (const type of types) {
      const result = await client.query(
        `INSERT INTO battleex.types (name) VALUES ($1) RETURNING id`,
        [type.name],
      );
      typeMap.set(type.name, result.rows[0].id);
    }

    for (const entry of typeEffectiveness) {
      await client.query(
        `
          INSERT INTO battleex.type_effectiveness (attacking_type_id, defending_type_id, multiplier)
          VALUES ($1, $2, $3)
        `,
        [
          typeMap.get(entry.attackingType),
          typeMap.get(entry.defendingType),
          entry.multiplier,
        ],
      );
    }

    const pokemonMap = new Map();
    for (const entry of pokemon) {
      const profileKey = String(entry.profileKey ?? entry.nationalDexNumber);
      const result = await client.query(
        `
          INSERT INTO battleex.pokemon (
            profile_key,
            national_dex_number,
            name,
            form_name,
            is_regional_variant,
            primary_type_id,
            secondary_type_id,
            hp,
            attack,
            defense,
            special_attack,
            special_defense,
            speed,
            base_stat_total,
            sprite_url,
            description_short,
            generation,
            introduced_in_game
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
          )
          RETURNING id
        `,
        [
          profileKey,
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
        ],
      );

      pokemonMap.set(profileKey, result.rows[0].id);
    }

    const abilityMap = new Map();
    for (const ability of abilities) {
      const result = await client.query(
        `
          INSERT INTO battleex.abilities (name, short_effect, full_effect, is_battle_relevant)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [ability.name, ability.shortEffect, ability.fullEffect, ability.isBattleRelevant],
      );

      abilityMap.set(ability.name, result.rows[0].id);
    }

    const moveMap = new Map();
    for (const move of moves) {
      const result = await client.query(
        `
          INSERT INTO battleex.moves (
            name,
            type_id,
            category,
            power,
            accuracy,
            pp,
            short_effect,
            full_effect,
            priority
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `,
        [
          move.name,
          typeMap.get(move.type),
          move.category,
          move.power,
          move.accuracy,
          move.pp,
          move.shortEffect,
          move.fullEffect,
          move.priority,
        ],
      );

      moveMap.set(move.name, result.rows[0].id);
    }

    const evolutionFamilyMap = new Map();
    for (const family of evolutionFamilies) {
      const result = await client.query(
        `
          INSERT INTO battleex.evolution_families (source_chain_id, is_branched)
          VALUES ($1, $2)
          RETURNING id
        `,
        [family.sourceChainId, Boolean(family.isBranched)],
      );

      evolutionFamilyMap.set(family.sourceChainId, result.rows[0].id);
    }

    for (const node of evolutionNodes) {
      const familyId = evolutionFamilyMap.get(node.sourceChainId);
      const pokemonId = pokemonMap.get(String(node.pokemonProfileKey));

      if (!familyId || !pokemonId) {
        continue;
      }

      await client.query(
        `
          INSERT INTO battleex.evolution_nodes (
            family_id,
            pokemon_id,
            depth,
            display_order,
            path_key,
            display_name
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (family_id, pokemon_id)
          DO UPDATE SET
            depth = EXCLUDED.depth,
            display_order = EXCLUDED.display_order,
            path_key = EXCLUDED.path_key,
            display_name = EXCLUDED.display_name
        `,
        [
          familyId,
          pokemonId,
          node.depth,
          node.displayOrder,
          node.pathKey || null,
          node.displayName || null,
        ],
      );
    }

    for (const edge of evolutionEdges) {
      const familyId = evolutionFamilyMap.get(edge.sourceChainId);
      const fromPokemonId = pokemonMap.get(String(edge.fromPokemonProfileKey));
      const toPokemonId = pokemonMap.get(String(edge.toPokemonProfileKey));

      if (!familyId || !fromPokemonId || !toPokemonId) {
        continue;
      }

      await client.query(
        `
          INSERT INTO battleex.evolution_edges (
            family_id,
            from_pokemon_id,
            to_pokemon_id,
            label,
            tooltip,
            sort_order
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (family_id, from_pokemon_id, to_pokemon_id)
          DO UPDATE SET
            label = EXCLUDED.label,
            tooltip = EXCLUDED.tooltip,
            sort_order = EXCLUDED.sort_order
        `,
        [
          familyId,
          fromPokemonId,
          toPokemonId,
          edge.label,
          edge.tooltip || null,
          edge.sortOrder || 0,
        ],
      );
    }

    for (const link of pokemonAbilities) {
      const pokemonId = pokemonMap.get(String(link.pokemonProfileKey ?? link.pokemonDex));
      const abilityId = abilityMap.get(link.abilityName);

      if (!pokemonId || !abilityId) {
        continue;
      }

      await client.query(
        `
          INSERT INTO battleex.pokemon_abilities (pokemon_id, ability_id, slot_type)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `,
        [pokemonId, abilityId, link.slotType],
      );
    }

    for (const link of pokemonMoves) {
      const pokemonId = pokemonMap.get(String(link.pokemonProfileKey ?? link.pokemonDex));
      const moveId = moveMap.get(link.moveName);

      if (!pokemonId || !moveId) {
        continue;
      }

      await client.query(
        `
          INSERT INTO battleex.pokemon_moves (pokemon_id, move_id, learn_method, is_notable_battle_move)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (pokemon_id, move_id)
          DO UPDATE SET
            learn_method = EXCLUDED.learn_method,
            is_notable_battle_move = EXCLUDED.is_notable_battle_move
        `,
        [pokemonId, moveId, link.learnMethod, Boolean(link.isNotableBattleMove)],
      );
    }

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
