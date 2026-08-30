import * as favoriteService from "../services/favorite.service.js";
import Favorite from "../models/favorite.model.js";

export async function addFavorite(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const songId = req.body.songId;

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

    const favorite = await favoriteService.addFavorite({ userId, songId });

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Song already added to favorites",
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function toggleFavorite(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const songId = req.body.songId;

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

    const result = await favoriteService.toggleFavorite({ userId, songId });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMyFavorites(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const { page = 1, limit = 20 } = req.query;

    const result = await favoriteService.getFavorites({
      userId,
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

export async function getFavorites(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required or please provide Authorization token",
      });
    }

    const result = await favoriteService.getFavorites({
      userId,
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

export async function checkFavorite(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    const songId = req.params.songId || req.query.songId;

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

    const result = await favoriteService.checkFavorite(userId, songId);

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

export async function getFavoriteById(req, res) {
  try {
    const favorite = await favoriteService.getFavoriteById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateFavorite(req, res) {
  try {
    const favorite = await favoriteService.updateFavorite(
      req.params.id,
      req.body
    );

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteFavorite(req, res) {
  try {
    const existing = await Favorite.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
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
        message: "You do not have permission to delete this favorite",
      });
    }

    await favoriteService.deleteFavorite(req.params.id);

    res.json({
      success: true,
      message: "Removed from favorites successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function removeFavoriteByUserAndSong(req, res) {
  try {
    const userId = req.user?.id || req.query.userId || req.body.userId;
    const songId = req.params.songId || req.query.songId || req.body.songId;

    if (!userId || !songId) {
      return res.status(400).json({
        success: false,
        message: "userId and songId are required",
      });
    }

    const favorite = await favoriteService.removeFavoriteByUserAndSong(
      userId,
      songId
    );

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.json({
      success: true,
      message: "Removed from favorites successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
