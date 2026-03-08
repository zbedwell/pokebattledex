import { Router } from "express";
import { createMovesController } from "../controllers/movesController.js";

export const createMovesRoutes = (services) => {
  const router = Router();
  const controller = createMovesController({ movesService: services.movesService });

  router.get("/", controller.listMoves);
  router.get("/:id", controller.getMoveDetail);

  return router;
};
