const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/movies.controller");
const asyncHandler = require("../utils/asyncHandler");
const { upload } = require("../middleware/upload");

const uploadFields = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
  { name: "video", maxCount: 1 }
]);

// List: /api/movies?type=tarjima&page=1&limit=12&sort=new&q=hello&year=2024
router.get("/", ctrl.list);

// Get by id
router.get("/:id", ctrl.getOne);

// Create (multipart)
router.post("/", uploadFields, ctrl.create);

// Put (multipart)
router.put("/:id", uploadFields, ctrl.putUpdate);

// Patch (multipart)
router.patch("/:id", uploadFields, ctrl.patchUpdate);

// Delete
router.delete("/:id", ctrl.remove);

// Views +1
router.post("/:id/view", ctrl.addView);

module.exports = router;
