import { notFound } from "../utils/httpErrors.js";

export const createMovesService = ({ movesRepository }) => ({
  async listMoves(filters) {
    const result = await movesRepository.listMoves(filters);

    return {
      data: result.rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        total_pages: Math.max(1, Math.ceil(result.total / filters.limit)),
      },
    };
  },

  async getMoveDetail(identifier) {
    const move = await movesRepository.getMoveByIdentifier(identifier);
    if (!move) {
      throw notFound("Move not found.");
    }

    const learnedBy = await movesRepository.getPokemonByMove(move.id);

    return {
      ...move,
      learned_by: learnedBy,
      badges: {
        contact: /contact/i.test(move.full_effect || ""),
        priority: Number(move.priority) > 0,
        setup: /raises/i.test(move.full_effect || "") || /boost/i.test(move.full_effect || ""),
        recovery: /recover/i.test(move.full_effect || "") || /heal/i.test(move.full_effect || ""),
        status_infliction: /burn|freeze|paraly|sleep|poison|confus/i.test(move.full_effect || ""),
      },
    };
  },
});
