const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ✅ UPLOAD_DIR bo‘lmasa: "uploads" (oldingi struktura saqlanadi)
const uploadDirName =
  typeof env.UPLOAD_DIR === "string" && env.UPLOAD_DIR.trim()
    ? env.UPLOAD_DIR.trim()
    : "uploads";

// ✅ absolyut base dir
const base = path.resolve(process.cwd(), uploadDirName);

const postersDir = path.join(base, "posters");
const backdropsDir = path.join(base, "backdrops");
const videosDir = path.join(base, "videos");

ensureDir(postersDir);
ensureDir(backdropsDir);
ensureDir(videosDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "poster") return cb(null, postersDir);
    if (file.fieldname === "backdrop") return cb(null, backdropsDir);
    if (file.fieldname === "video") return cb(null, videosDir);
    return cb(null, base);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  },
});

function fileFilter(req, file, cb) {
  // poster/backdrop -> image
  if (file.fieldname === "poster" || file.fieldname === "backdrop") {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Poster/backdrop must be an image file"));
    }
    return cb(null, true);
  }

  // video -> accept video/*
  if (file.fieldname === "video") {
    if (file.mimetype && file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }
    // ba’zi mkv’larda mimetype noto‘g‘ri kelishi mumkin, shuning uchun ext bilan ham ruxsat
    const ext = (path.extname(file.originalname || "") || "").toLowerCase();
    const allowed = [".mp4", ".mkv", ".avi", ".mov", ".webm"];
    if (allowed.includes(ext)) return cb(null, true);
    return cb(new Error("Video file type not allowed"));
  }

  return cb(null, true);
}

// ✅ LIMIT env’dan (xato bo‘lsa default)
const mb = Number(env.MAX_FILE_MB);
const maxBytes = (Number.isFinite(mb) && mb > 0 ? mb : 6000) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxBytes,
  },
});

module.exports = { upload };
