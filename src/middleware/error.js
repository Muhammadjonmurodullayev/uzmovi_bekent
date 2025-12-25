function notFound(req, res, next) {
  res.status(404).json({ message: "Not Found" });
}

function errorHandler(err, req, res, next) {
  // ✅ Multer: file too large
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "File too large",
      max_mb: Number(process.env.MAX_FILE_MB || 0)
    });
  }

  // ✅ Multer: boshqa upload xatolar
  if (err && err.name === "MulterError") {
    return res.status(400).json({
      message: err.message || "Upload error",
      code: err.code
    });
  }

  // zod validation errors
  if (err && err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      issues: err.issues
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server error"
  });
}

module.exports = { notFound, errorHandler };
