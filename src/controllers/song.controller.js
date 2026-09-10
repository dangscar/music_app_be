import * as songService from "../services/song.service.js";

export async function createSong(req, res) {
  try {
    const song = await songService.createSong(req.body);
    res.status(201).json({ success: true, data: song });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAllSongs(req, res) {
  try {
    const { page = 1, limit = 10, topicId, artistId, albumId, genre, search } = req.query;
    const userId = req.user?.id || req.query.userId;

    const result = await songService.getSongs(
      page,
      limit,
      {
        topicId,
        artistId,
        albumId,
        genre,
        search,
      },
      userId
    );

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

export async function getSongsByTopic(req, res) {
  try {
    const { page = 1, limit = 10, isFavorite } = req.query;
    const { topicId } = req.params;
    const userId = req.user?.id || req.query.userId;

    // isFavorite=true chỉ có tác dụng khi user đã đăng nhập
    const filterByFavorite = isFavorite === "true" && !!userId;

    const result = await songService.getSongsByTopic(topicId, page, limit, userId, filterByFavorite);

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

export async function getRandomSongs(req, res) {
  try {
    const { limit = 3 } = req.query;
    const userId = req.user?.id || req.query.userId;
    const songs = await songService.getRandomSongs(Number(limit) || 3, userId);

    res.json({
      success: true,
      data: songs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getSongById(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    const song = await songService.getSongById(req.params.id, userId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.json({ success: true, data: song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateSong(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    const song = await songService.updateSong(req.params.id, req.body, userId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.json({ success: true, data: song });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteSong(req, res) {
  try {
    const song = await songService.deleteSong(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}