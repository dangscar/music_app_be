import Playlist from "../models/playlist.model.js";
import PlaylistSong from "../models/playlistSong.model.js";

export async function createPlaylist(data) {
  return Playlist.create(data);
}

export async function getPlaylists({
  page = 1,
  limit = 10,
  userId,
  isPublic,
  search,
} = {}) {
  const query = {};

  if (userId) {
    query.userId = userId;
  }

  if (isPublic !== undefined) {
    query.isPublic = isPublic === "true" || isPublic === true;
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [playlists, total] = await Promise.all([
    Playlist.find(query)
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Playlist.countDocuments(query),
  ]);

  return {
    playlists,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getPlaylistById(id) {
  const playlist = await Playlist.findById(id).populate(
    "userId",
    "username email avatar"
  );

  if (!playlist) {
    return null;
  }

  // Lấy kèm danh sách bài hát trong playlist theo thứ tự order
  const playlistSongs = await PlaylistSong.find({ playlistId: id })
    .sort({ order: 1, addedAt: -1 })
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });

  return {
    ...playlist.toObject(),
    songs: playlistSongs,
  };
}

export async function updatePlaylist(id, data) {
  return Playlist.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("userId", "username email avatar");
}

export async function deletePlaylist(id) {
  const playlist = await Playlist.findByIdAndDelete(id);
  if (playlist) {
    // Xóa tất cả các bài hát thuộc playlist này
    await PlaylistSong.deleteMany({ playlistId: id });
  }
  return playlist;
}
