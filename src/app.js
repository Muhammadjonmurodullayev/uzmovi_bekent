const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const env = require("./config/env");
const moviesRoutes = require("./routes/movies.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

/**
 * ✅ FIX for:
 * net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)
 * Chrome ORB/CORP blocks cross-origin images/videos when Helmet sets:
 * Cross-Origin-Resource-Policy: same-origin
 *
 * We allow cross-origin resources for /uploads/* files.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // video/audio embed holatlari uchun ham yaxshi
    crossOriginEmbedderPolicy: false
  })
);

// Logs
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: (origin, cb) => {
      // Postman/Server-to-server (origin yo‘q) -> allow
      if (!origin) return cb(null, true);

      // Agar envda origin ro‘yxati bo‘lmasa -> hammasiga allow (dev uchun)
      if (!env.CORS_ORIGIN.length) return cb(null, true);

      // Ro‘yxatda bo‘lsa allow
      if (env.CORS_ORIGIN.includes(origin)) return cb(null, true);

      // Aks holda block
      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true
  })
);

// ✅ Static uploads (images/videos)
app.use(
  `/${env.UPLOAD_DIR}`,
  express.static(path.join(process.cwd(), env.UPLOAD_DIR))
);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/movies", moviesRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
