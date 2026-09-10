import * as playlistSongService from "../services/playlistSong.service.js";
import Playlist from "../models/playlist.model.js";
import PlaylistSong from "../models/playlistSong.model.js";

export async function addSongToPlaylist(req, res) {
  try {
    const playlistId = req.params.playlistId || req.body.playlistId;
    const songId = req.body.songId;
    const order = req.body.order;

    if (!playlistId || !songId) {
      return res.status(400).json({
        success: false,
        message: "playlistId and songId are required",
      });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      playlist.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this playlist",
      });
    }

    const playlistSong = await playlistSongService.addSongToPlaylist({
      playlistId,
      songId,
      order,
    });

    res.status(201).json({
      success: true,
      data: playlistSong,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Song already exists in this playlist",
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getPlaylistSongs(req, res) {
  try {
    const { playlistId: paramPlaylistId } = req.params;
    const { playlistId: queryPlaylistId, songId, page = 1, limit = 20 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const playlistId = paramPlaylistId || queryPlaylistId;

    const result = await playlistSongService.getPlaylistSongs({
      playlistId,
      songId,
      page,
      limit,
      userId,
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

export async function getPlaylistSongById(req, res) {
  try {
    const userId = req.user?.id || req.query.userId;
    const playlistSong = await playlistSongService.getPlaylistSongById(
      req.params.id,
      userId
    );

    if (!playlistSong) {
      return res.status(404).json({
        success: false,
        message: "Playlist song item not found",
      });
    }

    res.json({
      success: true,
      data: playlistSong,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updatePlaylistSong(req, res) {
  try {
    const playlistSong = await PlaylistSong.findById(req.params.id);
    if (!playlistSong) {
      return res.status(404).json({
        success: false,
        message: "Playlist song item not found",
      });
    }

    const playlist = await Playlist.findById(playlistSong.playlistId);
    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      playlist &&
      playlist.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this playlist",
      });
    }

    const updated = await playlistSongService.updatePlaylistSong(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deletePlaylistSong(req, res) {
  try {
    const playlistSong = await PlaylistSong.findById(req.params.id);
    if (!playlistSong) {
      return res.status(404).json({
        success: false,
        message: "Playlist song item not found",
      });
    }

    const playlist = await Playlist.findById(playlistSong.playlistId);
    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      playlist &&
      playlist.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this playlist",
      });
    }

    await playlistSongService.deletePlaylistSong(req.params.id);

    res.json({
      success: true,
      message: "Song removed from playlist successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function removeSongFromPlaylist(req, res) {
  try {
    const playlistId = req.params.playlistId || req.query.playlistId || req.body.playlistId;
    const songId = req.params.songId || req.query.songId || req.body.songId;

    if (!playlistId || !songId) {
      return res.status(400).json({
        success: false,
        message: "playlistId and songId are required",
      });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      playlist.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this playlist",
      });
    }

    const playlistSong = await playlistSongService.removeSongFromPlaylist(
      playlistId,
      songId
    );

    if (!playlistSong) {
      return res.status(404).json({
        success: false,
        message: "Song is not in this playlist",
      });
    }

    res.json({
      success: true,
      message: "Song removed from playlist successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getSongsByPlaylistId(req, res) {
  try {
    const { playlistId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const result = await playlistSongService.getSongsByPlaylistId({
      playlistId,
      page,
      limit,
      userId,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const status = error.message === "Playlist not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

