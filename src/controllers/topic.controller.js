import * as topicService from "../services/topic.service.js";

export async function createTopic(req, res) {
  try {
    const topic = await topicService.createTopic(req.body);
    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAllTopics(req, res) {
  try {
    const { page = 1, limit = 10, type, isActive, search } = req.query;

    const result = await topicService.getTopics({
      page,
      limit,
      type,
      isActive,
      search,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTopicById(req, res) {
  try {
    const topic = await topicService.getTopicById(req.params.id, req.user?.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTopicBySlug(req, res) {
  try {
    const topic = await topicService.getTopicBySlug(req.params.slug);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateTopic(req, res) {
  try {
    const topic = await topicService.updateTopic(req.params.id, req.body);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteTopic(req, res) {
  try {
    const topic = await topicService.deleteTopic(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
