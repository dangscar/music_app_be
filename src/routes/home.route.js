import { Router } from "express";
import { getHomeRecommendationsController } from "../controllers/home.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/home
router.get("/", optionalAuth, getHomeRecommendationsController);

// GET /api/home/recommendations (alias)
router.get("/recommendations", optionalAuth, getHomeRecommendationsController);

export default router;

