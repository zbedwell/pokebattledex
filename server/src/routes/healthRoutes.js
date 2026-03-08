import { Router } from "express";
import { createHealthController } from "../controllers/healthController.js";

export const createHealthRoutes = (services) => {
  const router = Router();
  const controller = createHealthController({ healthService: services.healthService });

  router.get("/data", controller.getDataHealth);

  return router;
};
