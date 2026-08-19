import { Router } from "express";
import {
  createArtistController,
  getArtistController,
  getArtistsController,
} from "../controllers/artist.controller.js";

const router = Router();

router.post("/", createArtistController);
router.get("/", getArtistsController);
router.get("/:id", getArtistController);

export default router;