import PlaylistSong from "../models/playlistSong.model.js";
import Playlist from "../models/playlist.model.js";
import Song from "../models/song.model.js";
import {
  attachIsFavoriteToSongs,
  attachIsFavoriteToSong,
} from "./favorite.service.js";

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
  userId = null,
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
      .limit(limitNum)
      .lean(),
    PlaylistSong.countDocuments(query),
  ]);

  const songsToAttach = playlistSongs
    .map((ps) => ps.songId)
    .filter((s) => s && typeof s === "object");

  const attachedSongs = await attachIsFavoriteToSongs(songsToAttach, userId);
  const songMap = new Map(attachedSongs.map((s) => [s._id.toString(), s]));

  const formattedPlaylistSongs = playlistSongs.map((ps) => {
    if (ps.songId && typeof ps.songId === "object") {
      const updated = songMap.get(ps.songId._id.toString());
      if (updated) {
        ps.songId = updated;
        ps.isFavorite = updated.isFavorite;
      }
    }
    return ps;
  });

  return {
    playlistSongs: formattedPlaylistSongs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getPlaylistSongById(id, userId = null) {
  const playlistSong = await PlaylistSong.findById(id)
    .populate("playlistId", "name coverImage userId")
    .populate({
      path: "songId",
      populate: [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
        { path: "topicIds", select: "name slug coverImage type color" },
      ],
    })
    .lean();

  if (!playlistSong) return null;

  if (playlistSong.songId && typeof playlistSong.songId === "object") {
    playlistSong.songId = await attachIsFavoriteToSong(playlistSong.songId, userId);
    playlistSong.isFavorite = playlistSong.songId.isFavorite;
  }

  return playlistSong;
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

export async function getSongsByPlaylistId({
  playlistId,
  page = 1,
  limit = 20,
  userId = null,
} = {}) {
  if (!playlistId) {
    throw new Error("playlistId is required");
  }

  const playlist = await Playlist.findById(playlistId).select("_id").lean();
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [playlistSongs, total] = await Promise.all([
    PlaylistSong.find({ playlistId })
      .populate({
        path: "songId",
        populate: [
          { path: "artistIds"},
          { path: "albumId"},
          { path: "topicIds" },
        ],
      })
      .sort({ order: 1, addedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    PlaylistSong.countDocuments({ playlistId }),
  ]);

  // Lấy chỉ phần song (bỏ wrapper playlistSong)
  const rawSongs = playlistSongs
    .map((ps) => ps.songId)
    .filter((s) => s && typeof s === "object");

  const songs = await attachIsFavoriteToSongs(rawSongs, userId);

  return {
    songs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}
