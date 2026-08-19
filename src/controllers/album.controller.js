import * as albumService from "../services/album.service.js";

export async function createAlbum(req, res) {
  try {
    const album = await albumService.createAlbum(req.body);

    res.status(201).json({
      success: true,
      data: album,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAllAlbums(req, res) {
  try {
    const albums = await albumService.getAllAlbums();

    res.json({
      success: true,
      data: albums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAlbumById(req, res) {
  try {
    const album = await albumService.getAlbumById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.json({
      success: true,
      data: album,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateAlbum(req, res) {
  try {
    const album = await albumService.updateAlbum(req.params.id, req.body);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.json({
      success: true,
      data: album,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteAlbum(req, res) {
  try {
    const album = await albumService.deleteAlbum(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}