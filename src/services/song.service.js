import Song from "../models/song.model.js";

export async function createSong(data) {
  return Song.create(data);
}

export async function getSongs(page = 1, limit = 10, filter = {}) {
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

  const [songs, total] = await Promise.all([
    Song.find(query)
      .populate("artistIds", "name avatar")
      .populate("albumId", "title coverImage")
      .populate("topicIds", "name slug coverImage type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Song.countDocuments(query),
  ]);

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

export async function getSongById(id) {
  return Song.findById(id)
    .populate("artistIds", "name avatar")
    .populate("albumId", "title coverImage")
    .populate("topicIds", "name slug coverImage type");
}

export async function getSongsByTopic(topicId, page = 1, limit = 10) {
  return getSongs(page, limit, { topicId });
}

export async function updateSong(id, data) {
  return Song.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("artistIds", "name avatar")
    .populate("albumId", "title coverImage")
    .populate("topicIds", "name slug coverImage type");
}

export async function getRandomSongs(limit = 3) {
  const size = Number(limit) || 3;
  const songs = await Song.aggregate([{ $sample: { size } }]);

  return Song.populate(songs, [
    { path: "artistIds", select: "name avatar" },
    { path: "albumId", select: "title coverImage" },
    { path: "topicIds", select: "name slug coverImage type" },
  ]);
}

export async function deleteSong(id) {
  return Song.findByIdAndDelete(id);
}