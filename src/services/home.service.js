import Song from "../models/song.model.js";
import Album from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import Topic from "../models/topic.model.js";

/**
 * Lấy dữ liệu đề xuất trang chủ bao gồm bài hát, album, nghệ sĩ và chủ đề
 * @param {Object} options
 * @param {number} [options.songLimit=10] - Số lượng bài hát đề xuất
 * @param {number} [options.albumLimit=10] - Số lượng album đề xuất
 * @param {number} [options.artistLimit=10] - Số lượng nghệ sĩ đề xuất
 * @param {number} [options.topicLimit=10] - Số lượng chủ đề đề xuất
 * @returns {Promise<{songs: Array, albums: Array, artists: Array, topics: Array}>}
 */
export async function getHomeRecommendations({
  songLimit = 10,
  albumLimit = 10,
  artistLimit = 10,
  topicLimit = 10,
} = {}) {
  const [songs, albums, artists, topics] = await Promise.all([
    // Bài hát đề xuất (ưu tiên theo lượt nghe cao và mới nhất)
    Song.find()
      .sort({ plays: -1, createdAt: -1 })
      .limit(Number(songLimit))
      .populate("artistIds", "name avatar bio")
      .populate("albumId", "title coverImage releaseDate")
      .populate("topicIds", "name slug coverImage type color")
      .lean(),

    // Album đề xuất (mới nhất hoặc theo ngày phát hành)
    Album.find()
      .sort({ releaseDate: -1, createdAt: -1 })
      .limit(Number(albumLimit))
      .populate("artistId", "name avatar")
      .lean(),

    // Nghệ sĩ đề xuất
    Artist.find()
      .sort({ createdAt: -1 })
      .limit(Number(artistLimit))
      .lean(),

    // Chủ đề đề xuất đang hoạt động
    Topic.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Number(topicLimit))
      .lean(),
  ]);

  return {
    songs,
    albums,
    artists,
    topics,
  };
}
