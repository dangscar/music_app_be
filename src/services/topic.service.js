import Topic from "../models/topic.model.js";

export function slugify(text) {
  if (!text) return "";
  return text
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

export async function createTopic(data) {
  const topicData = { ...data };
  if (topicData.colorCode && !topicData.color) {
    topicData.color = topicData.colorCode;
  }
  if (topicData.name && !topicData.slug) {
    topicData.slug = slugify(topicData.name);
  }
  return Topic.create(topicData);
}

export async function getTopics({
  page = 1,
  limit = 10,
  type,
  isActive,
  search,
} = {}) {
  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [topics, total] = await Promise.all([
    Topic.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Topic.countDocuments(filter),
  ]);

  return {
    topics,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getTopicById(id) {
  return Topic.findById(id);
}

export async function getTopicBySlug(slug) {
  return Topic.findOne({ slug });
}

export async function updateTopic(id, data) {
  const updateData = { ...data };
  if (updateData.colorCode && !updateData.color) {
    updateData.color = updateData.colorCode;
  }
  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  }

  return Topic.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deleteTopic(id) {
  return Topic.findByIdAndDelete(id);
}
