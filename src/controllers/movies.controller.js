const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/movies.service");
const { safeUnlink, toAbsFromProject } = require("../utils/file");

function toPublicPath(relUploadDir, filename, folder) {
  // /uploads/videos/abc.mp4
  return `/${relUploadDir}/${folder}/${filename}`;
}

function parseMaybeJSON(v) {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return undefined;
  }
}

exports.list = asyncHandler(async (req, res) => {
  const data = await service.getMovies(req.query);
  res.json(data);
});

exports.getOne = asyncHandler(async (req, res) => {
  const movie = await service.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ message: "Movie not found" });
  res.json(movie);
});

// POST: multipart/form-data (fields + files)
exports.create = asyncHandler(async (req, res) => {
  const { files = {} } = req;

  const posterFile = files.poster?.[0];
  const backdropFile = files.backdrop?.[0];
  const videoFile = files.video?.[0];

  const body = req.body;

  const movieData = {
    id: body.id,
    title: body.title,
    year: body.year ? Number(body.year) : undefined,
    country: body.country,
    quality: body.quality,
    rating: body.rating ? Number(body.rating) : undefined,
    views: body.views ? Number(body.views) : undefined,
    duration: body.duration,
    language: body.language,
    type: body.type,
    genres: parseMaybeJSON(body.genres),
    tags: parseMaybeJSON(body.tags),
    description: body.description
  };

  // Fayl yo‘llari DBga yoziladi
  if (posterFile) movieData.poster = toPublicPath(process.env.UPLOAD_DIR || "uploads", posterFile.filename, "posters");
  if (backdropFile) movieData.backdrop = toPublicPath(process.env.UPLOAD_DIR || "uploads", backdropFile.filename, "backdrops");
  if (videoFile) movieData.video_url = toPublicPath(process.env.UPLOAD_DIR || "uploads", videoFile.filename, "videos");

  const created = await service.createMovie(movieData);
  res.status(201).json(created);
});

// PUT: to‘liq update (multipart bo‘lishi mumkin)
exports.putUpdate = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const current = await service.getMovieById(id);
  if (!current) return res.status(404).json({ message: "Movie not found" });

  const { files = {} } = req;
  const posterFile = files.poster?.[0];
  const backdropFile = files.backdrop?.[0];
  const videoFile = files.video?.[0];

  const body = req.body;

  const patch = {
    title: body.title,
    year: body.year === "" ? null : body.year ? Number(body.year) : null,
    country: body.country ?? null,
    quality: body.quality ?? null,
    rating: body.rating === "" ? 0.0 : body.rating ? Number(body.rating) : 0.0,
    views: body.views === "" ? 0 : body.views ? Number(body.views) : 0,
    duration: body.duration ?? null,
    language: body.language ?? null,
    type: body.type ?? null,
    genres: parseMaybeJSON(body.genres) ?? null,
    tags: parseMaybeJSON(body.tags) ?? null,
    description: body.description ?? null,
    video_url: current.video_url
  };

  // fayl yangilansa eskisini o‘chiramiz
  if (posterFile) {
    safeUnlink(toAbsFromProject(current.poster));
    patch.poster = toPublicPath(process.env.UPLOAD_DIR || "uploads", posterFile.filename, "posters");
  }
  if (backdropFile) {
    safeUnlink(toAbsFromProject(current.backdrop));
    patch.backdrop = toPublicPath(process.env.UPLOAD_DIR || "uploads", backdropFile.filename, "backdrops");
  }
  if (videoFile) {
    safeUnlink(toAbsFromProject(current.video_url));
    patch.video_url = toPublicPath(process.env.UPLOAD_DIR || "uploads", videoFile.filename, "videos");
  }

  const updated = await service.updateMovie(id, patch);
  res.json(updated);
});

// PATCH: qisman update (multipart ham bo‘lishi mumkin)
exports.patchUpdate = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const current = await service.getMovieById(id);
  if (!current) return res.status(404).json({ message: "Movie not found" });

  const { files = {} } = req;
  const posterFile = files.poster?.[0];
  const backdropFile = files.backdrop?.[0];
  const videoFile = files.video?.[0];

  const body = req.body;

  const patch = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.year !== undefined) patch.year = body.year === "" ? null : Number(body.year);
  if (body.country !== undefined) patch.country = body.country || null;
  if (body.quality !== undefined) patch.quality = body.quality || null;
  if (body.rating !== undefined) patch.rating = body.rating === "" ? 0.0 : Number(body.rating);
  if (body.views !== undefined) patch.views = body.views === "" ? 0 : Number(body.views);
  if (body.duration !== undefined) patch.duration = body.duration || null;
  if (body.language !== undefined) patch.language = body.language || null;
  if (body.type !== undefined) patch.type = body.type || null;
  if (body.genres !== undefined) patch.genres = parseMaybeJSON(body.genres) ?? null;
  if (body.tags !== undefined) patch.tags = parseMaybeJSON(body.tags) ?? null;
  if (body.description !== undefined) patch.description = body.description || null;

  if (posterFile) {
    safeUnlink(toAbsFromProject(current.poster));
    patch.poster = toPublicPath(process.env.UPLOAD_DIR || "uploads", posterFile.filename, "posters");
  }
  if (backdropFile) {
    safeUnlink(toAbsFromProject(current.backdrop));
    patch.backdrop = toPublicPath(process.env.UPLOAD_DIR || "uploads", backdropFile.filename, "backdrops");
  }
  if (videoFile) {
    safeUnlink(toAbsFromProject(current.video_url));
    patch.video_url = toPublicPath(process.env.UPLOAD_DIR || "uploads", videoFile.filename, "videos");
  }

  const updated = await service.updateMovie(id, patch);
  res.json(updated);
});

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await service.deleteMovie(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Movie not found" });

  // DBdan o‘chirgandan keyin fayllarni ham o‘chiramiz
  safeUnlink(toAbsFromProject(deleted.poster));
  safeUnlink(toAbsFromProject(deleted.backdrop));
  safeUnlink(toAbsFromProject(deleted.video_url));

  res.json({ message: "Deleted", item: deleted });
});

exports.addView = asyncHandler(async (req, res) => {
  const movie = await service.incrementViews(req.params.id);
  if (!movie) return res.status(404).json({ message: "Movie not found" });
  res.json(movie);
});
