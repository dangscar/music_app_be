import express from "express";
import * as albumController from "../controllers/album.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", albumController.createAlbum);
router.get("/", albumController.getAllAlbums);
router.get("/:id", verifyToken, albumController.getAlbumById);
router.put("/:id", albumController.updateAlbum);
router.delete("/:id", albumController.deleteAlbum);

export default router;