import * as playlistService from "../services/playlist.service.js";
import Playlist from "../models/playlist.model.js";

export async function createPlaylist(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const playlist = await playlistService.createPlaylist({
      ...req.body,
      userId,
    });

    res.status(201).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMyPlaylists(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const { page = 1, limit = 20, search } = req.query;

    const result = await playlistService.getPlaylists({
      page,
      limit,
      userId,
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

export async function getAllPlaylists(req, res) {
  try {
    const { page = 1, limit = 10, userId, isPublic, search } = req.query;

    const result = await playlistService.getPlaylists({
      page,
      limit,
      userId,
      isPublic: isPublic !== undefined ? isPublic : true,
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

export async function getPlaylistById(req, res) {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Nếu playlist là private, kiểm tra quyền xem của chủ sở hữu
    if (!playlist.isPublic) {
      const currentUserId = req.user?.id;
      const ownerId = playlist.userId?._id?.toString() || playlist.userId?.toString();
      if (!currentUserId || (currentUserId !== ownerId && req.user?.role !== "admin")) {
        return res.status(403).json({
          success: false,
          message: "This playlist is private",
        });
      }
    }

    res.json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updatePlaylist(req, res) {
  try {
    const existingPlaylist = await Playlist.findById(req.params.id);
    if (!existingPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Kiểm tra quyền sở hữu
    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      existingPlaylist.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this playlist",
      });
    }

    const playlist = await playlistService.updatePlaylist(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deletePlaylist(req, res) {
  try {
    const existingPlaylist = await Playlist.findById(req.params.id);
    if (!existingPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Kiểm tra quyền sở hữu
    const currentUserId = req.user?.id;
    if (
      currentUserId &&
      existingPlaylist.userId.toString() !== currentUserId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this playlist",
      });
    }

    await playlistService.deletePlaylist(req.params.id);

    res.json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
