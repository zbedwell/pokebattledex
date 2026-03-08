import { asyncHandler } from "../utils/httpErrors.js";
import { validateListMovesQuery } from "../utils/validation.js";

export const createMovesController = ({ movesService }) => ({
  listMoves: asyncHandler(async (req, res) => {
    const query = validateListMovesQuery(req.query);
    const data = await movesService.listMoves(query);
    res.status(200).json(data);
  }),

  getMoveDetail: asyncHandler(async (req, res) => {
    const data = await movesService.getMoveDetail(req.params.id);
    res.status(200).json(data);
  }),
});
