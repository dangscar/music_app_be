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
    const populated = await Favorite.findById(existing._id)
      .populate("userId", "username email avatar")
      .populate({
        path: "songId",
        populate: [
          { path: "artistIds", select: "name avatar" },
          { path: "albumId", select: "title coverImage" },
          { path: "topicIds", select: "name slug coverImage type color" },
        ],
      })
      .lean();

    if (populated && populated.songId && typeof populated.songId === "object") {
      populated.songId = await attachIsFavoriteToSong(populated.songId, userId);
      populated.isFavorite = populated.songId.isFavorite;
    }
    return populated;
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
    })
    .lean();

  if (populated && populated.songId && typeof populated.songId === "object") {
    populated.songId = await attachIsFavoriteToSong(populated.songId, userId);
    populated.isFavorite = populated.songId.isFavorite;
  }

  return populated;
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
    })
    .lean();

  if (populated && populated.songId && typeof populated.songId === "object") {
    populated.songId = await attachIsFavoriteToSong(populated.songId, userId);
    populated.isFavorite = populated.songId.isFavorite;
  }

  return {
    isFavorite: true,
    message: "Added to favorites",
    data: populated,
  };
}

export async function getFavorites({
  userId,
  page = 1,
  limit = 20,
  currentUserId = null,
} = {}) {
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
      .limit(limitNum)
      .lean(),
    Favorite.countDocuments(query),
  ]);

  const targetCheckUserId = currentUserId || userId;

  const songsToAttach = favorites
    .map((fav) => fav.songId)
    .filter((s) => s && typeof s === "object");

  const attachedSongs = await attachIsFavoriteToSongs(
    songsToAttach,
    targetCheckUserId
  );
  const songMap = new Map(attachedSongs.map((s) => [s._id.toString(), s]));

  const formattedFavorites = favorites.map((fav) => {
    if (fav.songId && typeof fav.songId === "object") {
      const updated = songMap.get(fav.songId._id.toString());
      if (updated) {
        fav.songId = updated;
        fav.isFavorite = updated.isFavorite;
      }
    } else {
      fav.isFavorite = false;
    }
    return fav;
  });

  return {
    favorites: formattedFavorites,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getFavoriteById(id, userId = null) {
  const favorite = await Favorite.findById(id)
    .populate("userId", "username email avatar")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    })
    .lean();

  if (!favorite) return null;

  if (favorite.songId && typeof favorite.songId === "object") {
    const checkUserId = userId || favorite.userId?._id || favorite.userId;
    favorite.songId = await attachIsFavoriteToSong(favorite.songId, checkUserId);
    favorite.isFavorite = favorite.songId.isFavorite;
  }

  return favorite;
}

export async function checkFavorite(userId, songId) {
  const favorite = await Favorite.findOne({ userId, songId });
  return {
    isFavorite: !!favorite,
    favorite: favorite || null,
  };
}

export async function updateFavorite(id, data, userId = null) {
  const favorite = await Favorite.findByIdAndUpdate(id, data, {
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
    })
    .lean();

  if (!favorite) return null;

  if (favorite.songId && typeof favorite.songId === "object") {
    const checkUserId = userId || favorite.userId?._id || favorite.userId;
    favorite.songId = await attachIsFavoriteToSong(favorite.songId, checkUserId);
    favorite.isFavorite = favorite.songId.isFavorite;
  }

  return favorite;
}

export async function deleteFavorite(id) {
  return Favorite.findByIdAndDelete(id);
}

export async function removeFavoriteByUserAndSong(userId, songId) {
  return Favorite.findOneAndDelete({ userId, songId });
}

/**
 * Gắn trạng thái isFavorite vào danh sách bài hát dựa trên userId
 * @param {Array<Object>} songs - Danh sách bài hát (có thể là mongoose doc hoặc plain object)
 * @param {string|mongoose.Types.ObjectId} [userId] - ID của người dùng nếu có
 * @returns {Promise<Array<Object>>}
 */
export async function attachIsFavoriteToSongs(songs, userId) {
  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    return [];
  }

  const plainSongs = songs.map((song) =>
    typeof song?.toObject === "function" ? song.toObject() : { ...song }
  );

  if (!userId) {
    return plainSongs.map((song) => ({
      ...song,
      isFavorite: false,
    }));
  }

  const songIds = plainSongs
    .map((song) => song._id)
    .filter(Boolean);

  if (songIds.length === 0) {
    return plainSongs.map((song) => ({
      ...song,
      isFavorite: false,
    }));
  }

  const favorites = await Favorite.find({
    userId,
    songId: { $in: songIds },
  })
    .select("songId")
    .lean();

  const favoriteSongIdsSet = new Set(
    favorites.map((fav) => fav.songId.toString())
  );

  return plainSongs.map((song) => ({
    ...song,
    isFavorite: favoriteSongIdsSet.has(song._id?.toString()),
  }));
}

/**
 * Gắn trạng thái isFavorite vào một bài hát dựa trên userId
 * @param {Object} song - Bài hát (mongoose doc hoặc plain object)
 * @param {string|mongoose.Types.ObjectId} [userId] - ID của người dùng nếu có
 * @returns {Promise<Object|null>}
 */
export async function attachIsFavoriteToSong(song, userId) {
  if (!song) return null;

  const plainSong =
    typeof song?.toObject === "function" ? song.toObject() : { ...song };

  if (!userId || !plainSong._id) {
    return {
      ...plainSong,
      isFavorite: false,
    };
  }

  const exists = await Favorite.exists({
    userId,
    songId: plainSong._id,
  });

  return {
    ...plainSong,
    isFavorite: Boolean(exists),
  };
}
