import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
import artistRouter from "./routes/artist.routes.js";
import albumRoute from "./routes/album.route.js";
import songRoute from "./routes/song.route.js";
import homeRoute from "./routes/home.route.js";

const app = express();
app.use(cors());
app.use(express.json());

// Đảm bảo kết nối MongoDB trước khi xử lý request (Serverless / Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

app.use("/api/home", homeRoute);
app.use("/api/users", userRouter);
app.use("/api/artists", artistRouter);
app.use("/api/albums", albumRoute);
app.use("/api/songs", songRoute);

export default app;