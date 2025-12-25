const dotenv = require("dotenv");
dotenv.config();

function must(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === null || v === "") {
    throw new Error(`ENV is missing: ${name}`);
  }
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),

  CORS_ORIGIN: (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  DB_HOST: must("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: must("DB_USER"),
  DB_PASS: must("DB_PASS"),
  DB_NAME: must("DB_NAME"),
  DB_CONN_LIMIT: Number(process.env.DB_CONN_LIMIT || 10),

  UPLOAD_DIR: must("UPLOAD_DIR", "uploads"),
  MAX_FILE_MB: Number(process.env.MAX_FILE_MB || 1500)
};

module.exports = env;
