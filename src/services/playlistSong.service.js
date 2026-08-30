import PlaylistSong from "../models/playlistSong.model.js";
import Playlist from "../models/playlist.model.js";
import Song from "../models/song.model.js";

export async function addSongToPlaylist({ playlistId, songId, order }) {
  // Kiểm tra playlist và song có tồn tại không
  const [playlist, song] = await Promise.all([
    Playlist.findById(playlistId),
    Song.findById(songId),
  ]);

  if (!playlist) {
    throw new Error("Playlist not found");
  }
  if (!song) {
    throw new Error("Song not found");
  }

  // Nếu không truyền order, tự động tính order tiếp theo
  let songOrder = order;
  if (songOrder === undefined || songOrder === null) {
    const lastSong = await PlaylistSong.findOne({ playlistId })
      .sort({ order: -1 })
      .select("order");
    songOrder = lastSong ? lastSong.order + 1 : 1;
  }

  const playlistSong = await PlaylistSong.create({
    playlistId,
    songId,
    order: songOrder,
    addedAt: new Date(),
  });

  return PlaylistSong.findById(playlistSong._id)
    .populate("playlistId", "name coverImage userId")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });
}

export async function getPlaylistSongs({
  playlistId,
  songId,
  page = 1,
  limit = 20,
} = {}) {
  const query = {};

  if (playlistId) {
    query.playlistId = playlistId;
  }

  if (songId) {
    query.songId = songId;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [playlistSongs, total] = await Promise.all([
    PlaylistSong.find(query)
      .populate("playlistId", "name coverImage userId")
      .populate({
        path: "songId",
        populate: [
          { path: "artistIds", select: "name avatar" },
          { path: "albumId", select: "title coverImage" },
          { path: "topicIds", select: "name slug coverImage type color" },
        ],
      })
      .sort({ order: 1, addedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    PlaylistSong.countDocuments(query),
  ]);

  return {
    playlistSongs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getPlaylistSongById(id) {
  return PlaylistSong.findById(id)
    .populate("playlistId", "name coverImage userId")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });
}

export async function updatePlaylistSong(id, data) {
  return PlaylistSong.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("playlistId", "name coverImage userId")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    });
}

export async function deletePlaylistSong(id) {
  return PlaylistSong.findByIdAndDelete(id);
}

export async function removeSongFromPlaylist(playlistId, songId) {
  return PlaylistSong.findOneAndDelete({ playlistId, songId });
}
