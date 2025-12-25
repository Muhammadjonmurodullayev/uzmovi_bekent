const dotenv = require("dotenv");
dotenv.config();

function num(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: num(process.env.PORT, 4000),

  // CORS: "*" yoki "http://localhost:5173,https://site.netlify.app"
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  // DB (ixtiyoriy)
  DB_HOST: process.env.DB_HOST || "",
  DB_PORT: num(process.env.DB_PORT, 3306),
  DB_USER: process.env.DB_USER || "",
  DB_PASS: process.env.DB_PASS || "",
  DB_NAME: process.env.DB_NAME || "",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",


  // Upload limit
  MAX_FILE_MB: num(process.env.MAX_FILE_MB, 6000),

  // DBni vaqtincha o‘chirish uchun:
  // DB_ENABLED=false
  DB_ENABLED: (process.env.DB_ENABLED || "true").toLowerCase() !== "false",
};
