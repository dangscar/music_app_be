import { Router } from "express";
import { searchController } from "../controllers/search.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/search
router.get("/", optionalAuth, searchController);

export default router;

