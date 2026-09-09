import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createArtistController,
  getArtistController,
  getArtistsController,
} from "../controllers/artist.controller.js";

const router = Router();

router.post("/", createArtistController);
router.get("/", getArtistsController);
router.get("/:id", verifyToken, getArtistController);

export default router;