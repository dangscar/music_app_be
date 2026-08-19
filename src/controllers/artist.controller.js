import {
  createArtist,
  getArtistById,
  getArtists,
} from "../services/artist.service.js";

export async function createArtistController(req, res, next) {
  try {
    const artist = await createArtist(req.body);

    res.status(201).json({
      success: true,
      data: artist,
    });
  } catch (error) {
    next(error);
  }
}

export async function getArtistController(req, res, next) {
  try {
    const artist = await getArtistById(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    res.json({
      success: true,
      data: artist,
    });
  } catch (error) {
    next(error);
  }
}

export async function getArtistsController(req, res, next) {
  try {
    const result = await getArtists(req.query);

    res.json({
      success: true,
      data: result.artists,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}