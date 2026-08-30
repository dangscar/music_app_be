import * as listeningHistoryService from "../services/listeningHistory.service.js";
import ListeningHistory from "../models/listeningHistory.model.js";

export async function createListeningHistory(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const { songId, playedAt, durationPlayed } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "songId is required",
      });
    }

    const history = await listeningHistoryService.createListeningHistory({
      userId,
      songId,
      playedAt,
      durationPlayed,
    });

    res.status(201).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMyListeningHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const { songId, page = 1, limit = 20 } = req.query;

    const result = await listeningHistoryService.getListeningHistory({
      userId,
      songId,
      page,
      limit,
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

export async function getListeningHistory(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    const { songId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required or please provide Authorization token",
      });
    }

    const result = await listeningHistoryService.getListeningHistory({
      userId,
      songId,
      page,
      limit,
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

export async function getListeningHistoryById(req, res) {
  try {
    const history = await listeningHistoryService.getListeningHistoryById(
      req.params.id
    );

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Listening history entry not found",
      });
    }

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateListeningHistory(req, res) {
  try {
    const existing = await ListeningHistory.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Listening history entry not found",
      });
    }

    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      existing.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this history entry",
      });
    }

    const history = await listeningHistoryService.updateListeningHistory(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteListeningHistory(req, res) {
  try {
    const existing = await ListeningHistory.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Listening history entry not found",
      });
    }

    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      existing.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this history entry",
      });
    }

    await listeningHistoryService.deleteListeningHistory(req.params.id);

    res.json({
      success: true,
      message: "Listening history entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function clearMyHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    await listeningHistoryService.clearUserHistory(userId);

    res.json({
      success: true,
      message: "Your listening history cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function clearUserHistory(req, res) {
  try {
    const userId = req.params.userId || req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to clear this history",
      });
    }

    await listeningHistoryService.clearUserHistory(userId);

    res.json({
      success: true,
      message: "User listening history cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
