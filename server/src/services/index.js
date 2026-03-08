import { createTypeService } from "./typeService.js";
import { createPokemonService } from "./pokemonService.js";
import { createMovesService } from "./movesService.js";
import { createAbilitiesService } from "./abilitiesService.js";
import { createSearchService } from "./searchService.js";
import { createHealthService } from "./healthService.js";

export const createServices = (repositories) => {
  const typeService = createTypeService({ typesRepository: repositories.typesRepository });
  const pokemonService = createPokemonService({
    pokemonRepository: repositories.pokemonRepository,
    typeService,
  });
  const movesService = createMovesService({ movesRepository: repositories.movesRepository });
  const abilitiesService = createAbilitiesService({
    abilitiesRepository: repositories.abilitiesRepository,
  });
  const searchService = createSearchService({
    pokemonRepository: repositories.pokemonRepository,
    movesRepository: repositories.movesRepository,
    abilitiesRepository: repositories.abilitiesRepository,
    typesRepository: repositories.typesRepository,
  });
  const healthService = createHealthService({
    healthRepository: repositories.healthRepository,
  });

  return {
    typeService,
    pokemonService,
    movesService,
    abilitiesService,
    searchService,
    healthService,
  };
};
