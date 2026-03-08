import { createPokemonRepository } from "./pokemonRepository.js";
import { createMovesRepository } from "./movesRepository.js";
import { createAbilitiesRepository } from "./abilitiesRepository.js";
import { createTypesRepository } from "./typesRepository.js";
import { createHealthRepository } from "./healthRepository.js";

export const createRepositories = (db) => {
  return {
    pokemonRepository: createPokemonRepository(db),
    movesRepository: createMovesRepository(db),
    abilitiesRepository: createAbilitiesRepository(db),
    typesRepository: createTypesRepository(db),
    healthRepository: createHealthRepository(db),
  };
};
