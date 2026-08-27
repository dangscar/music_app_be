import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Topic from "../models/topic.model.js";

const DEFAULT_TOPIC_COLORS = {
  music: "#1DB954",
  podcast: "#8D67AB",
  "live-events": "#7358FF",
};

const FALLBACK_COLOR = "#1DB954";

async function migrate() {
  try {
    await connectDB();

    const topics = await Topic.find({
      $or: [{ color: { $exists: false } }, { color: null }, { color: "" }],
    });

    console.log(`Tìm thấy ${topics.length} chủ đề chưa có mã màu.`);

    let updatedCount = 0;
    for (const topic of topics) {
      const color = DEFAULT_TOPIC_COLORS[topic.slug] || FALLBACK_COLOR;
      await Topic.updateOne({ _id: topic._id }, { $set: { color } });
      updatedCount++;
      console.log(`- Đã cập nhật chủ đề "${topic.name}" (${topic.slug}) -> color: ${color}`);
    }

    console.log(
      `Đồng bộ thành công! Đã cập nhật mã màu cho ${updatedCount} chủ đề.`
    );
  } catch (error) {
    console.error("Lỗi khi đồng bộ database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
