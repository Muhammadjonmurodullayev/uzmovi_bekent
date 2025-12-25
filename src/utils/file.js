const fs = require("fs");
const path = require("path");

function safeUnlink(absPath) {
  try {
    if (!absPath) return;
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch (_) {}
}

function toAbsFromProject(relPath) {
  if (!relPath) return null;
  // relPath: /uploads/videos/xxx.mp4
  const cleaned = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  return path.join(process.cwd(), cleaned);
}

module.exports = { safeUnlink, toAbsFromProject };
