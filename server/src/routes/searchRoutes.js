import { Router } from "express";
import { createSearchController } from "../controllers/searchController.js";

export const createSearchRoutes = (services) => {
  const router = Router();
  const controller = createSearchController({ searchService: services.searchService });

  router.get("/", controller.search);

  return router;
};
