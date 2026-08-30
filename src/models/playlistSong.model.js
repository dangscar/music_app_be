import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
  {
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
    },
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "playlistSongs",
  }
);

playlistSongSchema.index({ playlistId: 1, songId: 1 }, { unique: true });

export const PlaylistSong = mongoose.model("PlaylistSong", playlistSongSchema);
export default PlaylistSong;
