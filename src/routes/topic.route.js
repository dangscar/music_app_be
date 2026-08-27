import express from "express";
import * as topicController from "../controllers/topic.controller.js";

const router = express.Router();

router.post("/", topicController.createTopic);
router.get("/", topicController.getAllTopics);
router.get("/slug/:slug", topicController.getTopicBySlug);
router.get("/:id", topicController.getTopicById);
router.put("/:id", topicController.updateTopic);
router.delete("/:id", topicController.deleteTopic);

export default router;
