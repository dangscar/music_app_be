import { Router } from "express";
import { getHomeRecommendationsController } from "../controllers/home.controller.js";

const router = Router();

// GET /api/home
router.get("/", getHomeRecommendationsController);

// GET /api/home/recommendations (alias)
router.get("/recommendations", getHomeRecommendationsController);

export default router;
