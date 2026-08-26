import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Song from "../models/song.model.js";

async function migrate() {
  try {
    await connectDB();
    const result = await Song.updateMany(
      { videoUrl: { $exists: false } },
      { $set: { videoUrl: null } }
    );
    console.log(`Cập nhật thành công! Tìm thấy: ${result.matchedCount}, đã sửa đổi: ${result.modifiedCount} bài hát.`);
  } catch (error) {
    console.error("Lỗi khi migrate:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
