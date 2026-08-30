import express from "express";
import * as favoriteController from "../controllers/favorite.controller.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, favoriteController.addFavorite);
router.post("/toggle", verifyToken, favoriteController.toggleFavorite);
router.get("/me", verifyToken, favoriteController.getMyFavorites);
router.get("/check", optionalAuth, favoriteController.checkFavorite);
router.get("/check/:songId", verifyToken, favoriteController.checkFavorite);
router.delete("/remove", verifyToken, favoriteController.removeFavoriteByUserAndSong);
router.delete("/song/:songId", verifyToken, favoriteController.removeFavoriteByUserAndSong);
router.get("/", optionalAuth, favoriteController.getFavorites);
router.get("/:id", optionalAuth, favoriteController.getFavoriteById);
router.put("/:id", verifyToken, favoriteController.updateFavorite);
router.delete("/:id", verifyToken, favoriteController.deleteFavorite);

export default router;
