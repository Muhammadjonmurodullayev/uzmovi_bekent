const mysql = require("mysql2/promise");
const env = require("./env");

let pool = null;

function isDbConfigured() {
  return !!(env.DB_HOST && env.DB_USER && env.DB_NAME);
}

function getPool() {
  if (pool) return pool;

  if (!env.DB_ENABLED) {
    console.warn("⚠️ DB is disabled by DB_ENABLED=false");
    return null;
  }

  if (!isDbConfigured()) {
    console.warn("⚠️ DB is not configured (DB_HOST/DB_USER/DB_NAME missing). Server will run without DB.");
    return null;
  }

  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10s
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  return pool;
}

async function dbPing() {
  const p = getPool();
  if (!p) return false;

  let conn;
  try {
    conn = await p.getConnection();
    await conn.ping();
    console.log("✅ MySQL connected");
    return true;
  } catch (e) {
    console.error("⚠️ MySQL ping failed:", e.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { getPool, dbPing };
