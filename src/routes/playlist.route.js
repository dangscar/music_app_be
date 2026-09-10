import express from "express";
import * as playlistController from "../controllers/playlist.controller.js";
import * as playlistSongController from "../controllers/playlistSong.controller.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, playlistController.createPlaylist);
router.get("/me", verifyToken, playlistController.getMyPlaylists);
router.get("/", verifyToken, playlistController.getAllPlaylists);

// Lấy songs theo playlistId có phân trang: GET /api/playlists/:playlistId/songs?page=1&limit=20
router.get("/:playlistId/songs", optionalAuth, playlistSongController.getSongsByPlaylistId);

router.get("/:id", verifyToken, playlistController.getPlaylistById);
router.put("/:id", verifyToken, playlistController.updatePlaylist);
router.delete("/:id", verifyToken, playlistController.deletePlaylist);

export default router;

