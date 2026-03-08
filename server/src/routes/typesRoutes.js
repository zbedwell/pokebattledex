import { Router } from "express";
import { createTypesController } from "../controllers/typesController.js";

export const createTypesRoutes = (services) => {
  const router = Router();
  const controller = createTypesController({ typeService: services.typeService });

  router.get("/", controller.listTypes);
  router.get("/chart", controller.getTypeChart);
  router.get("/matchup", controller.getTypeMatchup);
  router.get("/defense", controller.getDefenseSummary);

  return router;
};
