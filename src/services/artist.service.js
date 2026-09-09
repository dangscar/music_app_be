import { Artist } from "../models/artist.model.js";
import Song from "../models/song.model.js";
import Favorite from "../models/favorite.model.js";
export async function createArtist(data) {
  return Artist.create(data);
}

export async function getArtistById(id, userId) {
  const artist = await Artist.findById(id).lean();
  if (!artist) {
    return null;
  }

  const songs = await Song.find({
    artistIds: artist._id,
  })
    .populate("artistIds")
    .populate("albumId")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Nếu chưa đăng nhập
  if (!userId) {
    return {
      ...artist,
      songs: songs.map(song => ({
        ...song,
        isFavorite: false,
      })),
    };
  }

  const songIds = songs.map(song => song._id)
  

  const favorites = await Favorite.find({
    userId,
    songId: { $in: songIds },
  }).lean();

  const favoriteSongIds = new Set(
    favorites.map(favorite => favorite.songId.toString())
  );

  return {
    ...artist,
    songs: songs.map(song => ({
      ...song,
      isFavorite: favoriteSongIds.has(song._id.toString()),
    })),
  };
}

export async function getArtists({ page = 1, limit = 10 }) {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const [artists, total] = await Promise.all([
    Artist.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Artist.countDocuments(),
  ]);

  return {
    artists,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
}