import * as playlistService from "../services/playlist.service.js";
import Playlist from "../models/playlist.model.js";

export async function createPlaylist(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const { name, description, coverImage, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    const playlist = await playlistService.createPlaylist({
      name,
      description,
      coverImage,
      isPublic,
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

    const { page = 1, limit = 20, isPublic, search } = req.query;

    const result = await playlistService.getPlaylists({
      page,
      limit,
      userId,
      isPublic,
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const { page = 1, limit = 20, isPublic, search } = req.query;

    const result = await playlistService.getPlaylists({
      page,
      limit,
      userId,
      isPublic,
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const playlist = await playlistService.getPlaylistById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Kiểm tra quyền: Chỉ chủ sở hữu (hoặc admin) mới có thể xem playlist
    const ownerId = playlist.userId?._id?.toString() || playlist.userId?.toString();
    if (ownerId !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this playlist",
      });
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const existingPlaylist = await Playlist.findById(req.params.id);
    if (!existingPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Kiểm tra quyền sở hữu
    if (
      existingPlaylist.userId.toString() !== userId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this playlist",
      });
    }

    const { name, description, coverImage, isPublic } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const playlist = await playlistService.updatePlaylist(
      req.params.id,
      updateData
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const existingPlaylist = await Playlist.findById(req.params.id);
    if (!existingPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Kiểm tra quyền sở hữu
    if (
      existingPlaylist.userId.toString() !== userId &&
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

