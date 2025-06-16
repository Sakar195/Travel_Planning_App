const express = require("express");
const router = express.Router();
const {
  getAllTags,
  adminGetAllTags,
  adminCreateTag,
  adminUpdateTag,
  adminDeleteTag,
} = require("../controllers/tagController");
const { protect, admin } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

// @route   GET /api/tags
// @desc    Get all tags (for forms, etc.)
// @access  Public
router.get("/", getAllTags);

// @route   GET /api/tags/admin
// @desc    Get all tags with details (Admin only)
// @access  Private/Admin
router.get("/admin", protect, admin, adminGetAllTags);

// @route   POST /api/tags/admin
// @desc    Create a new tag (Admin only)
// @access  Private/Admin
router.post(
  "/admin",
  protect,
  admin,
  [
    body("name", "Tag name is required").trim().notEmpty(),
    body("description", "Description should be a string").optional().trim(),
  ],
  adminCreateTag
);

// @route   PUT /api/tags/:id
// @desc    Update a tag (Admin only)
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  admin,
  [
    // Optional validation: ensure ID is a valid MongoDB ObjectId
    // param('id').isMongoId(),
    body("name", "Tag name must be a non-empty string")
      .optional()
      .trim()
      .notEmpty(),
    body("description", "Description should be a string").optional().trim(),
  ],
  adminUpdateTag
);

// @route   DELETE /api/tags/:id
// @desc    Delete a tag (Admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  admin,
  // Optional validation: ensure ID is a valid MongoDB ObjectId
  // param('id').isMongoId(),
  adminDeleteTag
);

// TODO: Add PUT /admin/:id and DELETE /admin/:id routes for update/delete
// Removed TODO as routes are added above using /:id for consistency with client

module.exports = router;
