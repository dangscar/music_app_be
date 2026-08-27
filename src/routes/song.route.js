import express from "express";
import * as songController from "../controllers/song.controller.js";

const router = express.Router();

router.post("/", songController.createSong);
router.get("/", songController.getAllSongs);
router.get("/random", songController.getRandomSongs);
router.get("/topic/:topicId", songController.getSongsByTopic);
router.get("/:id", songController.getSongById);
router.put("/:id", songController.updateSong);
router.delete("/:id", songController.deleteSong);

export default router;