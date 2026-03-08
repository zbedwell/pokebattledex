import { asyncHandler } from "../utils/httpErrors.js";
import { validateSearchQuery } from "../utils/validation.js";

export const createSearchController = ({ searchService }) => ({
  search: asyncHandler(async (req, res) => {
    const query = validateSearchQuery(req.query);
    const data = await searchService.globalSearch(query.q);
    res.status(200).json(data);
  }),
});
