const { pool } = require("../config/db");

function parseJSONField(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function normalizeMovieRow(row) {
  return {
    ...row,
    genres: parseJSONField(row.genres),
    tags: parseJSONField(row.tags)
  };
}

async function getMovies({ type, year, q, sort = "new", page = 1, limit = 12 }) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 12));
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];

  if (type) {
    where.push("type = ?");
    params.push(type);
  }
  if (year) {
    where.push("year = ?");
    params.push(Number(year));
  }
  if (q) {
    where.push("(title LIKE ? OR country LIKE ? OR language LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  let orderBy = "created_at DESC";
  if (sort === "views") orderBy = "views DESC";
  if (sort === "rating") orderBy = "rating DESC";
  if (sort === "year") orderBy = "year DESC";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM movies ${whereSql}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const [rows] = await pool.query(
    `SELECT * FROM movies ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    items: rows.map(normalizeMovieRow)
  };
}

async function getMovieById(id) {
  const [rows] = await pool.query(`SELECT * FROM movies WHERE id = ? LIMIT 1`, [
    id
  ]);
  return rows[0] ? normalizeMovieRow(rows[0]) : null;
}

async function createMovie(data) {
  const sql = `
    INSERT INTO movies
    (id, title, year, country, quality, rating, views, duration, language, type, genres, tags, poster, backdrop, description, video_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.id,
    data.title,
    data.year ?? null,
    data.country ?? null,
    data.quality ?? null,
    data.rating ?? 0.0,
    data.views ?? 0,
    data.duration ?? null,
    data.language ?? null,
    data.type ?? null,
    data.genres ? JSON.stringify(data.genres) : null,
    data.tags ? JSON.stringify(data.tags) : null,
    data.poster ?? null,
    data.backdrop ?? null,
    data.description ?? null,
    data.video_url ?? null
  ];

  await pool.query(sql, params);
  return getMovieById(data.id);
}

async function updateMovie(id, patch) {
  const fields = [];
  const params = [];

  const allowed = [
    "title",
    "year",
    "country",
    "quality",
    "rating",
    "views",
    "duration",
    "language",
    "type",
    "genres",
    "tags",
    "poster",
    "backdrop",
    "description",
    "video_url"
  ];

  for (const key of allowed) {
    if (patch[key] === undefined) continue;

    if (key === "genres" || key === "tags") {
      fields.push(`${key} = ?`);
      params.push(patch[key] ? JSON.stringify(patch[key]) : null);
      continue;
    }

    fields.push(`${key} = ?`);
    params.push(patch[key]);
  }

  if (!fields.length) return getMovieById(id);

  params.push(id);
  await pool.query(`UPDATE movies SET ${fields.join(", ")} WHERE id = ?`, params);
  return getMovieById(id);
}

async function deleteMovie(id) {
  const movie = await getMovieById(id);
  if (!movie) return null;
  await pool.query(`DELETE FROM movies WHERE id = ?`, [id]);
  return movie;
}

async function incrementViews(id) {
  await pool.query(`UPDATE movies SET views = views + 1 WHERE id = ?`, [id]);
  return getMovieById(id);
}

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  incrementViews
};
