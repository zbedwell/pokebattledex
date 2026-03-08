import { asyncHandler } from "../utils/httpErrors.js";
import {
  validateTypeDefenseQuery,
  validateTypeMatchupQuery,
} from "../utils/validation.js";

export const createTypesController = ({ typeService }) => ({
  listTypes: asyncHandler(async (_req, res) => {
    const data = await typeService.listTypes();
    res.status(200).json(data);
  }),

  getTypeChart: asyncHandler(async (_req, res) => {
    const data = await typeService.getTypeChart();
    res.status(200).json(data);
  }),

  getTypeMatchup: asyncHandler(async (req, res) => {
    const query = validateTypeMatchupQuery(req.query);
    const defendingTypes = query.defending
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean)
      .slice(0, 2);

    const multiplier = await typeService.getMatchup(query.attacking, defendingTypes);

    res.status(200).json({
      attacking: query.attacking,
      defending: defendingTypes,
      multiplier,
    });
  }),

  getDefenseSummary: asyncHandler(async (req, res) => {
    const query = validateTypeDefenseQuery(req.query);
    const defendingTypes = query.types
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean)
      .slice(0, 2);

    const summary = await typeService.getDefensiveMatchup(defendingTypes);

    res.status(200).json({
      defending: defendingTypes,
      ...summary,
    });
  }),
});
