import * as searchService from "../services/search.service.js";

/**
 * Controller xử lý tìm kiếm trả về danh sách liền mạch các bài hát, nghệ sĩ và album
 */
export async function searchController(req, res) {
  try {
    const {
      q,
      query: searchQuery,
      search: searchParam,
      keyword,
      type = "all",
      page = 1,
      limit = 20,
    } = req.query;

    const searchTerm = q || searchQuery || searchParam || keyword || "";
    const userId = req.user?.id || req.query.userId;

    const result = await searchService.search({
      query: searchTerm,
      type,
      page,
      limit,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: result.items, // Trả về danh sách mảng liền mạch
      total: result.total,
      counts: result.counts,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error during search",
      error: error.message,
    });
  }
}
