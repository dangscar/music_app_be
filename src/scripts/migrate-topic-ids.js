import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Song from "../models/song.model.js";

async function migrate() {
  try {
    await connectDB();
    const result = await Song.updateMany(
      { topicIds: { $exists: false } },
      { $set: { topicIds: [] } }
    );
    console.log(
      `Đồng bộ thành công! Tìm thấy: ${result.matchedCount}, đã cập nhật topicIds: ${result.modifiedCount} bài hát.`
    );
  } catch (error) {
    console.error("Lỗi khi đồng bộ database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
