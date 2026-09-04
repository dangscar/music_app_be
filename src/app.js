import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
import artistRouter from "./routes/artist.routes.js";
import albumRoute from "./routes/album.route.js";
import songRoute from "./routes/song.route.js";
import homeRoute from "./routes/home.route.js";
import topicRoute from "./routes/topic.route.js";
import playlistRoute from "./routes/playlist.route.js";
import playlistSongRoute from "./routes/playlistSong.route.js";
import favoriteRoute from "./routes/favorite.route.js";
import listeningHistoryRoute from "./routes/listeningHistory.route.js";
import searchRoute from "./routes/search.route.js";

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
app.use("/api/topics", topicRoute);
app.use("/api/playlists", playlistRoute);
app.use("/api/playlist-songs", playlistSongRoute);
app.use("/api/favorites", favoriteRoute);
app.use("/api/listening-history", listeningHistoryRoute);
app.use("/api/listening-histories", listeningHistoryRoute);
app.use("/api/search", searchRoute);

export default app;