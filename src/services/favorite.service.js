import Favorite from "../models/favorite.model.js";
import User from "../models/user.model.js";
import Song from "../models/song.model.js";

export async function addFavorite({ userId, songId }) {
  const [user, song] = await Promise.all([
    User.findById(userId),
    Song.findById(songId),
  ]);

  if (!user) {
    throw new Error("User not found");
  }
  if (!song) {
    throw new Error("Song not found");
  }

  const existing = await Favorite.findOne({ userId, songId });
  if (existing) {
    return Favorite.findById(existing._id)
      .populate("userId", "username email avatar")
      .populate({
        path: "songId",
        populate: [
          { path: "artistIds", select: "name avatar" },
          { path: "albumId", select: "title coverImage" },
          { path: "topicIds", select: "name slug coverImage type color" },
        ],
      });
  }

  const favorite = await Favorite.create({ userId, songId });

  return Favorite.findById(favorite._id)
    .populate("userId", "username email avatar")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });
}

export async function toggleFavorite({ userId, songId }) {
  const [user, song] = await Promise.all([
    User.findById(userId),
    Song.findById(songId),
  ]);

  if (!user) {
    throw new Error("User not found");
  }
  if (!song) {
    throw new Error("Song not found");
  }

  const existing = await Favorite.findOne({ userId, songId });
  if (existing) {
    await Favorite.findByIdAndDelete(existing._id);
    return {
      isFavorite: false,
      message: "Removed from favorites",
    };
  }

  const favorite = await Favorite.create({ userId, songId });
  const populated = await Favorite.findById(favorite._id)
    .populate("userId", "username email avatar")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });

  return {
    isFavorite: true,
    message: "Added to favorites",
    data: populated,
  };
}

export async function getFavorites({ userId, page = 1, limit = 20 } = {}) {
  const query = {};

  if (userId) {
    query.userId = userId;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [favorites, total] = await Promise.all([
    Favorite.find(query)
      .populate("userId", "username email avatar")
      .populate({
        path: "songId",
        populate: [
          { path: "artistIds", select: "name avatar" },
          { path: "albumId", select: "title coverImage" },
          { path: "topicIds", select: "name slug coverImage type color" },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Favorite.countDocuments(query),
  ]);

  return {
    favorites,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getFavoriteById(id) {
  return Favorite.findById(id)
    .populate("userId", "username email avatar")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });
}

export async function checkFavorite(userId, songId) {
  const favorite = await Favorite.findOne({ userId, songId });
  return {
    isFavorite: !!favorite,
    favorite: favorite || null,
  };
}

export async function updateFavorite(id, data) {
  return Favorite.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("userId", "username email avatar")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });
}

export async function deleteFavorite(id) {
  return Favorite.findByIdAndDelete(id);
}

export async function removeFavoriteByUserAndSong(userId, songId) {
  return Favorite.findOneAndDelete({ userId, songId });
}
