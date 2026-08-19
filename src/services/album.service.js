import Album from "../models/album.model.js";

export async function createAlbum(data) {
  return Album.create(data);
}

export async function getAllAlbums() {
  return Album.find().populate("artistId", "name avatar");
}

export async function getAlbumById(id) {
  return Album.findById(id).populate("artistId", "name avatar");
}

export async function updateAlbum(id, data) {
  return Album.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteAlbum(id) {
  return Album.findByIdAndDelete(id);
}