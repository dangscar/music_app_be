import Album from "../models/album.model.js";
import Song from "../models/song.model.js";
import Favorite from "../models/favorite.model.js";

export async function createAlbum(data) {
  return Album.create(data);
}

export async function getAllAlbums() {
  return Album.find().populate("artistId", "name avatar");
}

export async function getAlbumById(id, userId) {
  const album = await Album.findById(id)
    .populate("artistId", "name avatar")
    .lean();

  if (!album) {
    return null;
  }

  const songs = await Song.find({
    albumId: album._id,
  })
    .populate("artistIds", "name avatar")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Chưa đăng nhập
  if (!userId) {
    return {
      ...album,
      songs: songs.map((song) => ({
        ...song,
        isFavorite: false,
      })),
    };
  }

  // Lấy danh sách songId
  const songIds = songs.map((song) => song._id);

  // Tìm những bài user đã favorite
  const favorites = await Favorite.find({
    userId,
    songId: { $in: songIds },
  }).lean();

  const favoriteSongIds = new Set(
    favorites.map((favorite) => favorite.songId.toString())
  );

  return {
    ...album,
    songs: songs.map((song) => ({
      ...song,
      isFavorite: favoriteSongIds.has(
        song._id.toString()
      ),
    })),
  };
}

export async function updateAlbum(id, data) {
  return Album.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteAlbum(id) {
  return Album.findByIdAndDelete(id);
}