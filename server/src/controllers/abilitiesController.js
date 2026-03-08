import { asyncHandler } from "../utils/httpErrors.js";
import { validateListAbilitiesQuery } from "../utils/validation.js";

export const createAbilitiesController = ({ abilitiesService }) => ({
  listAbilities: asyncHandler(async (req, res) => {
    const query = validateListAbilitiesQuery(req.query);
    const data = await abilitiesService.listAbilities(query);
    res.status(200).json(data);
  }),

  getAbilityDetail: asyncHandler(async (req, res) => {
    const data = await abilitiesService.getAbilityDetail(req.params.id);
    res.status(200).json(data);
  }),
});
