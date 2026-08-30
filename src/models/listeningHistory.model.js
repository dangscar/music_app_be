import mongoose from "mongoose";

const listeningHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
    durationPlayed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "listeningHistory",
  }
);

listeningHistorySchema.index({ userId: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model(
  "ListeningHistory",
  listeningHistorySchema
);
export default ListeningHistory;
