import { Router } from "express";
import { createPokemonController } from "../controllers/pokemonController.js";

export const createPokemonRoutes = (services) => {
  const router = Router();
  const controller = createPokemonController({ pokemonService: services.pokemonService });

  router.get("/", controller.listPokemon);
  router.get("/options", controller.listPokemonOptions);
  router.get("/compare", controller.comparePokemon);
  router.get("/:id/evolution", controller.getPokemonEvolution);
  router.get("/:id", controller.getPokemonDetail);
  router.get("/:id/moves", controller.getPokemonMoves);
  router.get("/:id/abilities", controller.getPokemonAbilities);

  return router;
};
