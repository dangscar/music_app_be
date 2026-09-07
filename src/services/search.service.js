import Song from "../models/song.model.js";
import Album from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { attachIsFavoriteToSongs } from "./favorite.service.js";

/**
 * Thoát các ký tự đặc biệt trong biểu thức chính quy để tránh lỗi RegExp và ReDoS
 * @param {string} text
 * @returns {string}
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Tính điểm tương đồng để sắp xếp kết quả liền mạch theo độ liên quan
 * @param {Object} item
 * @param {string} queryLower
 * @returns {number}
 */
function getRelevanceScore(item, queryLower) {
  const nameLower = (item.title || item.name || "").toLowerCase();
  let score = 0;

  if (nameLower === queryLower) {
    score += 100; // Khớp chính xác hoàn toàn
  } else if (nameLower.startsWith(queryLower)) {
    score += 80; // Bắt đầu bằng từ khóa
  } else if (nameLower.includes(queryLower)) {
    score += 50; // Chứa từ khóa
  } else {
    score += 30; // Khớp thông qua nghệ sĩ liên quan
  }

  // Ưu tiên nghệ sĩ lên đầu nếu tên nghệ sĩ khớp từ khóa
  if (item.type === "artist") {
    if (nameLower === queryLower) score += 25;
    else if (nameLower.startsWith(queryLower)) score += 15;
  }

  // Ưu tiên phụ cho bài hát có lượt nghe cao
  if (item.type === "song" && item.plays) {
    score += Math.min(10, Math.log10(item.plays + 1));
  }

  return score;
}

/**
 * Tìm kiếm tổng hợp trả về danh sách liền mạch gồm các bài hát, nghệ sĩ và album
 * @param {Object} params
 * @param {string} params.query - Từ khóa tìm kiếm
 * @param {string} [params.type='all'] - Loại kết quả ('all', 'songs', 'albums', 'artists')
 * @param {number} [params.page=1] - Trang hiện tại
 * @param {number} [params.limit=20] - Giới hạn số lượng kết quả trả về
 * @returns {Promise<Object>}
 */
export async function search({
  query = "",
  type = "all",
  page = 1,
  limit = 20,
  userId = null,
} = {}) {
  const trimmedQuery = (query || "").trim();
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);

  // Nếu không có từ khóa, trả về mảng rỗng liền mạch
  if (!trimmedQuery) {
    return {
      keyword: "",
      items: [],
      total: 0,
      counts: { songs: 0, albums: 0, artists: 0 },
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
      },
    };
  }

  const normalizedType = String(type).toLowerCase();
  const shouldSearchAll = normalizedType === "all" || !normalizedType;
  const shouldSearchSongs = shouldSearchAll || normalizedType === "songs" || normalizedType === "song";
  const shouldSearchAlbums = shouldSearchAll || normalizedType === "albums" || normalizedType === "album";
  const shouldSearchArtists = shouldSearchAll || normalizedType === "artists" || normalizedType === "artist";

  const safeRegex = new RegExp(escapeRegex(trimmedQuery), "i");

  // Tìm nghệ sĩ khớp từ khóa để hỗ trợ liên kết bài hát và album theo nghệ sĩ
  const matchedArtists = await Artist.find({ name: safeRegex }).select("_id").lean();
  const matchedArtistIds = matchedArtists.map((a) => a._id);

  const songQuery =
    matchedArtistIds.length > 0
      ? {
          $or: [
            { title: safeRegex },
            { artistIds: { $in: matchedArtistIds } },
          ],
        }
      : { title: safeRegex };

  const albumQuery =
    matchedArtistIds.length > 0
      ? {
          $or: [
            { title: safeRegex },
            { artistId: { $in: matchedArtistIds } },
          ],
        }
      : { title: safeRegex };

  const artistQuery = { name: safeRegex };

  const startIndex = (pageNum - 1) * limitNum;
  const fetchLimit = startIndex + limitNum;

  const promises = [];

  // 1. Tìm bài hát (Song)
  if (shouldSearchSongs) {
    promises.push(
      Song.find(songQuery)
        .populate("artistIds", "name avatar bio")
        .populate("albumId", "title coverImage releaseDate")
        .populate("topicIds", "name slug coverImage type color")
        .sort({ plays: -1, createdAt: -1 })
        .limit(fetchLimit)
        .lean(),
      Song.countDocuments(songQuery)
    );
  } else {
    promises.push(Promise.resolve([]), Promise.resolve(0));
  }

  // 2. Tìm Album
  if (shouldSearchAlbums) {
    promises.push(
      Album.find(albumQuery)
        .populate("artistId", "name avatar")
        .sort({ releaseDate: -1, createdAt: -1 })
        .limit(fetchLimit)
        .lean(),
      Album.countDocuments(albumQuery)
    );
  } else {
    promises.push(Promise.resolve([]), Promise.resolve(0));
  }

  // 3. Tìm Nghệ sĩ (Artist)
  if (shouldSearchArtists) {
    promises.push(
      Artist.find(artistQuery)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .lean(),
      Artist.countDocuments(artistQuery)
    );
  } else {
    promises.push(Promise.resolve([]), Promise.resolve(0));
  }

  const [
    songs,
    totalSongs,
    albums,
    totalAlbums,
    artists,
    totalArtists,
  ] = await Promise.all(promises);

  const songsWithFavorite = shouldSearchSongs
    ? await attachIsFavoriteToSongs(songs, userId)
    : [];

  // Chuẩn hóa bài hát có trường type="song"
  const formattedSongs = songsWithFavorite.map((song) => ({
    type: "song",
    ...song,
    name: song.title,
    image: song.coverImage || "",
    subtitle: Array.isArray(song.artistIds)
      ? song.artistIds.map((a) => a.name).filter(Boolean).join(", ")
      : "Bài hát",
  }));

  // Chuẩn hóa nghệ sĩ có trường type="artist"
  const formattedArtists = artists.map((artist) => ({
    type: "artist",
    ...artist,
    title: artist.name,
    image: artist.avatar || "",
    subtitle: "Nghệ sĩ",
  }));

  // Chuẩn hóa album có trường type="album"
  const formattedAlbums = albums.map((album) => ({
    type: "album",
    ...album,
    name: album.title,
    image: album.coverImage || "",
    subtitle: album.artistId?.name || "Album",
  }));

  // Gộp tất cả thành 1 danh sách liền mạch
  const allItems = [...formattedArtists, ...formattedSongs, ...formattedAlbums];

  // Sắp xếp theo độ liên quan
  const queryLower = trimmedQuery.toLowerCase();
  allItems.sort((a, b) => getRelevanceScore(b, queryLower) - getRelevanceScore(a, queryLower));

  // Cắt trang cho danh sách liền mạch
  const totalItems = totalSongs + totalAlbums + totalArtists;
  const paginatedItems = allItems.slice(startIndex, startIndex + limitNum);

  return {
    keyword: trimmedQuery,
    items: paginatedItems,
    total: totalItems,
    counts: {
      songs: totalSongs,
      albums: totalAlbums,
      artists: totalArtists,
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalItems / limitNum),
    },
  };
}
