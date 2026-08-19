import { Artist } from "../models/artist.model.js";

export async function createArtist(data) {
  return Artist.create(data);
}

export async function getArtistById(id) {
  return Artist.findById(id);
}

export async function getArtists({ page = 1, limit = 10 }) {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const [artists, total] = await Promise.all([
    Artist.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Artist.countDocuments(),
  ]);

  return {
    artists,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
}