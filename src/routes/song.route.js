import express from "express";
import * as songController from "../controllers/song.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", songController.createSong);
router.get("/", optionalAuth, songController.getAllSongs);
router.get("/random", optionalAuth, songController.getRandomSongs);
router.get("/topic/:topicId", optionalAuth, songController.getSongsByTopic);
router.get("/:id", optionalAuth, songController.getSongById);
router.put("/:id", optionalAuth, songController.updateSong);
router.delete("/:id", songController.deleteSong);

export default router;