import express from "express";
import * as listeningHistoryController from "../controllers/listeningHistory.controller.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, listeningHistoryController.createListeningHistory);
router.get("/me", verifyToken, listeningHistoryController.getMyListeningHistory);
router.delete("/me", verifyToken, listeningHistoryController.clearMyHistory);
router.delete("/user/:userId", verifyToken, listeningHistoryController.clearUserHistory);
router.get("/", optionalAuth, listeningHistoryController.getListeningHistory);
router.get("/:id", optionalAuth, listeningHistoryController.getListeningHistoryById);
router.put("/:id", verifyToken, listeningHistoryController.updateListeningHistory);
router.delete("/:id", verifyToken, listeningHistoryController.deleteListeningHistory);

export default router;
