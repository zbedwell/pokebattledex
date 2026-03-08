import { z } from "zod";
import { badRequest } from "./httpErrors.js";

const toNumberIfPresent = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const orderSchema = z.enum(["asc", "desc"]).default("asc");

const pokemonSortSchema = z
  .enum([
    "name",
    "base_stat_total",
    "speed",
    "attack",
    "special_attack",
    "defense",
    "special_defense",
    "hp",
  ])
  .default("name");

const listPokemonSchema = z.object({
  q: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  type1: z.string().trim().min(1).optional(),
  type2: z.string().trim().min(1).optional(),
  ability: z.string().trim().min(1).optional(),
  min_hp: z.coerce.number().int().min(1).max(255).optional(),
  min_attack: z.coerce.number().int().min(1).max(255).optional(),
  min_defense: z.coerce.number().int().min(1).max(255).optional(),
  min_special_attack: z.coerce.number().int().min(1).max(255).optional(),
  min_special_defense: z.coerce.number().int().min(1).max(255).optional(),
  min_speed: z.coerce.number().int().min(1).max(255).optional(),
  tag: z.string().trim().min(1).optional(),
  sort: pokemonSortSchema.optional(),
  order: orderSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(151).default(20),
});

const listMovesSchema = z.object({
  q: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  category: z.enum(["Physical", "Special", "Status"]).optional(),
  min_power: z.coerce.number().int().min(0).max(250).optional(),
  max_power: z.coerce.number().int().min(0).max(250).optional(),
  min_accuracy: z.coerce.number().int().min(0).max(100).optional(),
  is_status: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  sort: z.enum(["name", "power", "accuracy", "pp"]).default("name"),
  order: orderSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

const listAbilitiesSchema = z.object({
  q: z.string().trim().min(1).optional(),
  sort: z.enum(["name", "pokemon_count"]).default("name"),
  order: orderSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

const compareSchema = z.object({
  ids: z.string().trim().min(1),
});

const pokemonOptionsSchema = z.object({
  q: z.string().trim().min(2),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

const searchSchema = z.object({
  q: z.string().trim().min(1),
});

const typeMatchupSchema = z.object({
  attacking: z.string().trim().min(1),
  defending: z.string().trim().min(1),
});

const typeDefenseSchema = z.object({
  types: z.string().trim().min(1),
});

const parseWithSchema = (schema, value, label = "query parameters") => {
  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, raw]) => [key, toNumberIfPresent(raw)]),
  );

  const result = schema.safeParse(normalized);
  if (!result.success) {
    throw badRequest(`Invalid ${label}.`, result.error.flatten());
  }

  return result.data;
};

export const validateListPokemonQuery = (query) => parseWithSchema(listPokemonSchema, query);
export const validateListMovesQuery = (query) => parseWithSchema(listMovesSchema, query);
export const validateListAbilitiesQuery = (query) => parseWithSchema(listAbilitiesSchema, query);
export const validateCompareQuery = (query) => parseWithSchema(compareSchema, query);
export const validatePokemonOptionsQuery = (query) => parseWithSchema(pokemonOptionsSchema, query);
export const validateSearchQuery = (query) => parseWithSchema(searchSchema, query);
export const validateTypeMatchupQuery = (query) => parseWithSchema(typeMatchupSchema, query);
export const validateTypeDefenseQuery = (query) => parseWithSchema(typeDefenseSchema, query);
