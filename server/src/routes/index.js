import { Router } from "express";
import { createPokemonRoutes } from "./pokemonRoutes.js";
import { createMovesRoutes } from "./movesRoutes.js";
import { createAbilitiesRoutes } from "./abilitiesRoutes.js";
import { createTypesRoutes } from "./typesRoutes.js";
import { createSearchRoutes } from "./searchRoutes.js";
import { createHealthRoutes } from "./healthRoutes.js";

export const createApiRouter = (services) => {
  const router = Router();

  router.use("/pokemon", createPokemonRoutes(services));
  router.use("/moves", createMovesRoutes(services));
  router.use("/abilities", createAbilitiesRoutes(services));
  router.use("/types", createTypesRoutes(services));
  router.use("/search", createSearchRoutes(services));
  router.use("/health", createHealthRoutes(services));

  return router;
};
