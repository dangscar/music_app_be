import Song from "../models/song.model.js";


export async function createSong(data) {
    return Song.create(data);
}

export async function getSongs(page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const [songs, total] = await Promise.all([
        Song.find()
            .populate("artistIds", "name avatar")
            .populate("albumId", "title coverImage")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Song.countDocuments(),
    ]);

    return {
        songs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getSongById(id) {
    return Song.findById(id)
        .populate("artistIds", "name avatar")
        .populate("albumId", "title coverImage");
}

export async function updateSong(id, data) {
    return Song.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
}

export async function getRandomSongs(limit = 3) {
    const size = Number(limit) || 3;
    const songs = await Song.aggregate([
        { $sample: { size } },
    ]);

    return Song.populate(songs, [
        { path: "artistIds", select: "name avatar" },
        { path: "albumId", select: "title coverImage" },
    ]);
}

export async function deleteSong(id) {
    return Song.findByIdAndDelete(id);
}