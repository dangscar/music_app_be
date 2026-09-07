import * as homeService from "../services/home.service.js";

/**
 * Controller lấy dữ liệu trang chủ đề xuất
 */
export async function getHomeRecommendationsController(req, res) {
  try {
    const {
      limit,
      songLimit = limit || 10,
      albumLimit = limit || 10,
      artistLimit = limit || 10,
      topicLimit = limit || 10,
    } = req.query;
    const userId = req.user?.id || req.query.userId;

    const data = await homeService.getHomeRecommendations({
      songLimit,
      albumLimit,
      artistLimit,
      topicLimit,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Get home recommendations successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
