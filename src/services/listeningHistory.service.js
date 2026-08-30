import ListeningHistory from "../models/listeningHistory.model.js";
import User from "../models/user.model.js";
import Song from "../models/song.model.js";

export async function createListeningHistory({
  userId,
  songId,
  playedAt = new Date(),
  durationPlayed = 0,
}) {
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

  // Tăng lượt nghe của bài hát
  await Song.findByIdAndUpdate(songId, { $inc: { plays: 1 } });

  const history = await ListeningHistory.create({
    userId,
    songId,
    playedAt: playedAt ? new Date(playedAt) : new Date(),
    durationPlayed: Number(durationPlayed) || 0,
  });

  return ListeningHistory.findById(history._id)
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

export async function getListeningHistory({
  userId,
  songId,
  page = 1,
  limit = 20,
} = {}) {
  const query = {};

  if (userId) {
    query.userId = userId;
  }

  if (songId) {
    query.songId = songId;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [history, total] = await Promise.all([
    ListeningHistory.find(query)
      .populate("userId", "username email avatar")
      .populate({
        path: "songId",
        populate: [
          { path: "artistIds", select: "name avatar" },
          { path: "albumId", select: "title coverImage" },
          { path: "topicIds", select: "name slug coverImage type color" },
        ],
      })
      .sort({ playedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ListeningHistory.countDocuments(query),
  ]);

  return {
    history,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getListeningHistoryById(id) {
  return ListeningHistory.findById(id)
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

export async function updateListeningHistory(id, data) {
  const updateData = { ...data };
  if (updateData.playedAt) {
    updateData.playedAt = new Date(updateData.playedAt);
  }
  if (updateData.durationPlayed !== undefined) {
    updateData.durationPlayed = Number(updateData.durationPlayed);
  }

  return ListeningHistory.findByIdAndUpdate(id, updateData, {
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

export async function deleteListeningHistory(id) {
  return ListeningHistory.findByIdAndDelete(id);
}

export async function clearUserHistory(userId) {
  return ListeningHistory.deleteMany({ userId });
}
