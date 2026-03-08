import { badRequest } from "../utils/httpErrors.js";

export const createSearchService = ({ pokemonRepository, movesRepository, abilitiesRepository, typesRepository }) => ({
  async globalSearch(query) {
    const q = query.trim();
    if (q.length < 2) {
      throw badRequest("Search query must be at least 2 characters.");
    }

    const [pokemon, moves, abilities, types] = await Promise.all([
      pokemonRepository.searchPokemon(q),
      movesRepository.searchMoves(q),
      abilitiesRepository.searchAbilities(q),
      typesRepository.searchTypes(q),
    ]);

    return { pokemon, moves, abilities, types };
  },
});
