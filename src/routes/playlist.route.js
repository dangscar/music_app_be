import express from "express";
import * as playlistController from "../controllers/playlist.controller.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, playlistController.createPlaylist);
router.get("/me", verifyToken, playlistController.getMyPlaylists);
router.get("/", optionalAuth, playlistController.getAllPlaylists);
router.get("/:id", optionalAuth, playlistController.getPlaylistById);
router.put("/:id", verifyToken, playlistController.updatePlaylist);
router.delete("/:id", verifyToken, playlistController.deletePlaylist);

export default router;
