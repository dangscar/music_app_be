import express from "express";
import * as topicController from "../controllers/topic.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, topicController.createTopic);
router.get("/", topicController.getAllTopics);
router.get("/slug/:slug", topicController.getTopicBySlug);
router.get("/:id", topicController.getTopicById);
router.put("/:id", verifyToken, topicController.updateTopic);
router.delete("/:id", verifyToken, topicController.deleteTopic);

export default router;
