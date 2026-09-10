import Song from "../models/song.model.js";
import Favorite from "../models/favorite.model.js";
import {
  attachIsFavoriteToSongs,
  attachIsFavoriteToSong,
} from "./favorite.service.js";

export async function createSong(data) {
  const song = await Song.create(data);
  return attachIsFavoriteToSong(song, null);
}

export async function getSongs(page = 1, limit = 10, filter = {}, userId = null) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (filter.topicId) {
    query.topicIds = filter.topicId;
  }

  if (filter.artistId) {
    query.artistIds = filter.artistId;
  }

  if (filter.albumId) {
    query.albumId = filter.albumId;
  }

  if (filter.genre) {
    query.genre = filter.genre;
  }

  if (filter.search) {
    query.title = { $regex: filter.search, $options: "i" };
  }

  // Lọc chỉ các bài hát user đã yêu thích
  if (filter.isFavorite && userId) {
    const favoriteDocs = await Favorite.find({ userId }).select("songId").lean();
    const favoriteSongIds = favoriteDocs.map((f) => f.songId);
    query._id = { $in: favoriteSongIds };
  }

  const [songs, total] = await Promise.all([
    Song.find(query)
      .populate("artistIds", "name avatar")
      .populate("albumId", "title coverImage")
      .populate("topicIds", "name slug coverImage type color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Song.countDocuments(query),
  ]);

  const songsWithFavorite = await attachIsFavoriteToSongs(songs, userId);

  return {
    songs: songsWithFavorite,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getSongById(id, userId = null) {
  const song = await Song.findById(id)
    .populate("artistIds", "name avatar")
    .populate("albumId", "title coverImage")
    .populate("topicIds", "name slug coverImage type color")
    .lean();

  if (!song) return null;

  return attachIsFavoriteToSong(song, userId);
}

export async function getSongsByTopic(topicId, page = 1, limit = 10, userId = null, isFavorite = false) {
  return getSongs(page, limit, { topicId, isFavorite }, userId);
}

export async function updateSong(id, data, userId = null) {
  const song = await Song.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("artistIds", "name avatar")
    .populate("albumId", "title coverImage")
    .populate("topicIds", "name slug coverImage type color")
    .lean();

  if (!song) return null;

  return attachIsFavoriteToSong(song, userId);
}

export async function getRandomSongs(limit = 3, userId = null) {
  const size = Number(limit) || 3;
  const songs = await Song.aggregate([{ $sample: { size } }]);

  const populatedSongs = await Song.populate(songs, [
    { path: "artistIds", select: "name avatar" },
    { path: "albumId", select: "title coverImage" },
    { path: "topicIds", select: "name slug coverImage type color" },
  ]);

  return attachIsFavoriteToSongs(populatedSongs, userId);
}

export async function deleteSong(id) {
  return Song.findByIdAndDelete(id);
}