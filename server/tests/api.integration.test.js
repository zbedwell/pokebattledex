import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createServices } from "../src/services/index.js";
import { createInMemoryRepositories } from "./helpers/createInMemoryRepositories.js";

const buildTestApp = (options = {}) => {
  const repositories = createInMemoryRepositories(options);
  const services = createServices(repositories);
  return createApp({ services, nodeEnv: "test" });
};

describe("API integration", () => {
  it("filters and paginates /api/pokemon", async () => {
    const app = buildTestApp();
    const response = await request(app).get(
      "/api/pokemon?min_speed=80&sort=speed&order=desc&page=1&limit=2",
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
    expect(response.body.data[0].speed).toBeGreaterThanOrEqual(response.body.data[1].speed);
  });

  it("rejects invalid numeric query parameters", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon?min_speed=fast");

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid/);
  });

  it("returns grouped global search results", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/search?q=ar");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("pokemon");
    expect(response.body).toHaveProperty("moves");
    expect(response.body).toHaveProperty("abilities");
    expect(response.body).toHaveProperty("types");
    expect(response.body.pokemon.some((entry) => entry.name === "Charizard")).toBe(true);
  });

  it("resolves numeric identifier by pokemon id before national dex fallback", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/613");

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(613);
    expect(response.body.name).toBe("Yamask (Galarian)");
  });

  it("validates compare IDs and rejects duplicates", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/compare?ids=6,6");

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Duplicate/);
  });

  it("returns lightweight pokemon options ranked with prefix matches first", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/options?q=ar&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(1);
    expect(response.body[0].name).toBe("Arbok");
    expect(response.body[1].name).toBe("Charizard");
    expect(response.body[0]).toEqual({
      id: 24,
      name: "Arbok",
      national_dex_number: 24,
      sprite_url: "arbok.png",
      primary_type: "Poison",
      secondary_type: null,
    });
  });

  it("includes mega and primal forms in pokemon list and option search", async () => {
    const app = buildTestApp();

    const megaList = await request(app).get("/api/pokemon?q=mega&limit=10");
    expect(megaList.status).toBe(200);
    expect(megaList.body.data.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(["Charizard (Mega X)", "Charizard (Mega Y)"]),
    );

    const primalList = await request(app).get("/api/pokemon?q=primal&limit=10");
    expect(primalList.status).toBe(200);
    expect(primalList.body.data.map((entry) => entry.name)).toContain("Groudon (Primal)");

    const options = await request(app).get("/api/pokemon/options?q=primal&limit=10");
    expect(options.status).toBe(200);
    expect(options.body.map((entry) => entry.name)).toContain("Groudon (Primal)");
  });

  it("validates pokemon options query constraints", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/options?q=a&limit=99");

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid/);
  });

  it("returns compare highlights for valid input", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/compare?ids=6,130");

    expect(response.status).toBe(200);
    expect(response.body.pokemon).toHaveLength(2);
    expect(response.body.highlights.highest_speed).toBe("Charizard");
    expect(response.body.highlights.highest_special_attack).toBe("Charizard");
    expect(response.body.highlights.highest_attack).toBe("Gyarados");
    expect(response.body.highlights.highest_physical_bulk).toBe("Gyarados");
    expect(response.body.highlights.highest_special_bulk).toBe("Gyarados");
    expect(response.body.highlights.most_resistances).toBe("Charizard");
    expect(response.body.highlights.fewest_weaknesses).toBe("Gyarados");
    expect(response.body.highlights.shared_weaknesses).toContain("Rock");
  });

  it("returns a branched evolution payload for dedicated evolution endpoint", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/133/evolution");

    expect(response.status).toBe(200);
    expect(response.body.family_id).toBe(67);
    expect(response.body.is_branched).toBe(true);
    expect(response.body.layout).toEqual({
      orientation_hint_desktop: "horizontal",
      orientation_hint_mobile: "vertical",
    });
    expect(response.body.nodes.map((node) => node.name)).toEqual(["Eevee", "Vaporeon", "Jolteon"]);
    expect(response.body.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from_pokemon_id: 133, to_pokemon_id: 134, label: "Use Water Stone" }),
        expect.objectContaining({ from_pokemon_id: 133, to_pokemon_id: 135, label: "Use Thunder Stone" }),
      ]),
    );
  });

  it("returns form-specific evolution subgraphs for regional variants", async () => {
    const app = buildTestApp();

    const regular = await request(app).get("/api/pokemon/612/evolution");
    expect(regular.status).toBe(200);
    expect(regular.body.nodes.map((node) => node.name)).toEqual(["Yamask", "Cofagrigus"]);
    expect(regular.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 612,
        to_pokemon_id: 563,
        label: "Level 34",
      }),
    ]);

    const galar = await request(app).get("/api/pokemon/613/evolution");
    expect(galar.status).toBe(200);
    expect(galar.body.nodes.map((node) => node.name)).toEqual([
      "Yamask (Galarian)",
      "Runerigus",
    ]);
    expect(galar.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 613,
        to_pokemon_id: 867,
      }),
    ]);
  });

  it("builds fallback evolution line for alolan forms when variant rows are missing", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/44/evolution");

    expect(response.status).toBe(200);
    expect(response.body.nodes.map((node) => node.name)).toEqual([
      "Vulpix (Alolan)",
      "Ninetales (Alolan)",
    ]);
    expect(response.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 44,
        to_pokemon_id: 46,
        label: "Use Ice Stone",
      }),
    ]);
  });

  it("returns expected Meowth evolution lines across Kantonian, Alolan, and Galarian forms", async () => {
    const app = buildTestApp();
    const regular = await request(app).get("/api/pokemon/520/evolution");
    const alola = await request(app).get("/api/pokemon/522/evolution");
    const galar = await request(app).get("/api/pokemon/521/evolution");

    expect(regular.status).toBe(200);
    expect(regular.body.nodes.map((node) => node.name)).toEqual(["Meowth", "Persian"]);
    expect(regular.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 520,
        to_pokemon_id: 530,
      }),
    ]);

    expect(alola.status).toBe(200);
    expect(alola.body.nodes.map((node) => node.name)).toEqual([
      "Meowth (Alolan)",
      "Persian (Alolan)",
    ]);
    expect(alola.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 522,
        to_pokemon_id: 531,
      }),
    ]);

    expect(galar.status).toBe(200);
    expect(galar.body.nodes.map((node) => node.name)).toEqual([
      "Meowth (Galarian)",
      "Perrserker",
    ]);
    expect(galar.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 521,
        to_pokemon_id: 864,
      }),
    ]);
  });

  it("adds mega and primal transformation branches to evolution payloads", async () => {
    const app = buildTestApp();

    const mega = await request(app).get("/api/pokemon/6/evolution");
    expect(mega.status).toBe(200);
    expect(mega.body.nodes.map((node) => node.name)).toEqual(
      expect.arrayContaining(["Charizard (Mega X)", "Charizard (Mega Y)"]),
    );
    expect(mega.body.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from_pokemon_id: 6,
          to_pokemon_id: 6006,
          label: "Mega Evolution (Charizardite X)",
        }),
        expect.objectContaining({
          from_pokemon_id: 6,
          to_pokemon_id: 6007,
          label: "Mega Evolution (Charizardite Y)",
        }),
      ]),
    );

    const primal = await request(app).get("/api/pokemon/383/evolution");
    expect(primal.status).toBe(200);
    expect(primal.body.nodes.map((node) => node.name)).toEqual(["Groudon", "Groudon (Primal)"]);
    expect(primal.body.edges).toEqual([
      expect.objectContaining({
        from_pokemon_id: 383,
        to_pokemon_id: 7001,
        label: "Primal Reversion (Red Orb)",
      }),
    ]);
  });

  it("embeds evolution_line in pokemon detail payload", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/6");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("evolution_line");
    expect(response.body).toHaveProperty("obtain_methods_by_game");
    expect(response.body.obtain_methods_by_game).toHaveLength(38);
    expect(response.body.obtain_methods_by_game).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: "Red",
          methods: ["Evolve"],
          locations: [{ location: "Evolution", methods: ["Evolve"] }],
        }),
        expect.objectContaining({
          game: "Sun",
          methods: ["Gift"],
          locations: [
            { location: "Route 3", methods: ["Gift"] },
            { location: "Route 12", methods: ["Gift"] },
          ],
        }),
        expect.objectContaining({
          game: "Sword",
          methods: ["Static Encounter"],
          locations: [{ location: "Lake of Outrage", methods: ["Static Encounter"] }],
        }),
        expect.objectContaining({
          game: "Moon",
          methods: ["Not obtainable"],
          locations: [],
        }),
        expect.objectContaining({
          game: "Legends: Z-A",
          methods: ["Not obtainable"],
          locations: [],
        }),
      ]),
    );
    expect(response.body.evolution_line.nodes.map((node) => node.name)).toEqual([
      "Charmander",
      "Charmeleon",
      "Charizard",
      "Charizard (Mega X)",
      "Charizard (Mega Y)",
    ]);
  });

  it("keeps mega detail obtain data as battle-only and skips evolve backfill", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/6006");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Charizard (Mega X)");
    expect(response.body.obtain_methods_by_game).toHaveLength(38);
    expect(response.body.obtain_methods_by_game).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: "X",
          methods: ["Mega Evolution"],
          locations: [{ location: "Battle Transformation", methods: ["Mega Evolution"] }],
        }),
        expect.objectContaining({
          game: "Red",
          methods: ["Not obtainable"],
          locations: [],
        }),
      ]),
    );
    expect(
      response.body.obtain_methods_by_game.some((entry) => (entry.methods || []).includes("Evolve")),
    ).toBe(false);
  });

  it("keeps mega/primal type and ability overrides while inheriting base move lists", async () => {
    const app = buildTestApp();
    const [charizard, megaX, megaY, primal] = await Promise.all([
      request(app).get("/api/pokemon/6"),
      request(app).get("/api/pokemon/6006"),
      request(app).get("/api/pokemon/6007"),
      request(app).get("/api/pokemon/7001"),
    ]);

    expect(charizard.status).toBe(200);
    expect(megaX.status).toBe(200);
    expect(megaY.status).toBe(200);
    expect(primal.status).toBe(200);

    expect([megaX.body.primary_type, megaX.body.secondary_type].filter(Boolean)).toEqual(["Fire", "Dragon"]);
    expect(megaX.body.abilities.map((entry) => entry.name)).toEqual(["Tough Claws"]);
    expect([megaY.body.primary_type, megaY.body.secondary_type].filter(Boolean)).toEqual(["Fire", "Flying"]);
    expect(megaY.body.abilities.map((entry) => entry.name)).toEqual(["Drought"]);
    expect([primal.body.primary_type, primal.body.secondary_type].filter(Boolean)).toEqual(["Ground", "Fire"]);
    expect(primal.body.abilities.map((entry) => entry.name)).toEqual(["Desolate Land"]);

    const [baseMoves, megaXMoves, megaYMoves] = await Promise.all([
      request(app).get("/api/pokemon/6/moves"),
      request(app).get("/api/pokemon/6006/moves"),
      request(app).get("/api/pokemon/6007/moves"),
    ]);

    expect(baseMoves.status).toBe(200);
    expect(megaXMoves.status).toBe(200);
    expect(megaYMoves.status).toBe(200);

    const baseMoveNames = baseMoves.body.moves.map((entry) => entry.name);
    expect(megaXMoves.body.moves.map((entry) => entry.name)).toEqual(baseMoveNames);
    expect(megaYMoves.body.moves.map((entry) => entry.name)).toEqual(baseMoveNames);
  });

  it("keeps dex numeric lookups pinned to base form when battle-only forms share dex", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/6");

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(6);
    expect(response.body.name).toBe("Charizard");
  });

  it("returns graceful no-evolution payload when no family rows exist", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/24/evolution");

    expect(response.status).toBe(200);
    expect(response.body.no_evolutions).toBe(true);
    expect(response.body.nodes).toHaveLength(1);
    expect(response.body.nodes[0].name).toBe("Arbok");
    expect(response.body.edges).toEqual([]);
  });

  it("returns 404 for missing pokemon evolution route", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/99999/evolution");

    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/Pokemon not found/i);
  });

  it("computes defensive type summary", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/types/defense?types=Water,Flying");

    expect(response.status).toBe(200);
    expect(response.body.weaknesses_4x).toContain("Electric");
  });

  it("returns healthy data status when seeded", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/health/data");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.seeded).toBe(true);
    expect(response.body.counts.pokemon).toBeGreaterThan(0);
    expect(response.body.counts.moves).toBeGreaterThan(0);
  });

  it("returns degraded data status when not seeded", async () => {
    const app = buildTestApp({ seeded: false });
    const response = await request(app).get("/api/health/data");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("degraded");
    expect(response.body.seeded).toBe(false);
    expect(response.body.counts).toEqual({ pokemon: 0, moves: 0 });
  });
});
