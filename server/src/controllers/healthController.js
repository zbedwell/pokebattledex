import { asyncHandler } from "../utils/httpErrors.js";

export const createHealthController = ({ healthService }) => ({
  getDataHealth: asyncHandler(async (_req, res) => {
    const health = await healthService.getDataHealth();
    res.status(200).json(health);
  }),
});
