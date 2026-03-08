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

  it("embeds evolution_line in pokemon detail payload", async () => {
    const app = buildTestApp();
    const response = await request(app).get("/api/pokemon/6");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("evolution_line");
    expect(response.body.evolution_line.nodes.map((node) => node.name)).toEqual([
      "Charmander",
      "Charmeleon",
      "Charizard",
    ]);
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
