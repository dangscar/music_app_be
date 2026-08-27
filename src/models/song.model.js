import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artistIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
        required: true,
      },
    ],
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      default: null,
    },
    topicIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    genre: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: "",
    },
    lyrics: {
      type: String,
      default: "",
    },
    plays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Song", songSchema);