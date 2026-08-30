import express from "express";
import * as playlistSongController from "../controllers/playlistSong.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, playlistSongController.addSongToPlaylist);
router.get("/", playlistSongController.getPlaylistSongs);
router.delete("/remove", verifyToken, playlistSongController.removeSongFromPlaylist);
router.get("/:id", playlistSongController.getPlaylistSongById);
router.put("/:id", verifyToken, playlistSongController.updatePlaylistSong);
router.delete("/:id", verifyToken, playlistSongController.deletePlaylistSong);

export default router;
