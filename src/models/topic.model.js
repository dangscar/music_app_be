import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "mood",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "topics",
  }
);

// Tự động tạo slug nếu chưa được gán
topicSchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
});

export const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
