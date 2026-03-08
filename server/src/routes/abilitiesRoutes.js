import { Router } from "express";
import { createAbilitiesController } from "../controllers/abilitiesController.js";

export const createAbilitiesRoutes = (services) => {
  const router = Router();
  const controller = createAbilitiesController({ abilitiesService: services.abilitiesService });

  router.get("/", controller.listAbilities);
  router.get("/:id", controller.getAbilityDetail);

  return router;
};
