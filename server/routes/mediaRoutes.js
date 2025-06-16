const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const mediaController = require("../controllers/mediaController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { validate } = require("../middleware/validationMiddleware");

// @route   GET /api/media/user
// @desc    Get all media for the authenticated user
// @access  Private
router.get("/user", protect, mediaController.getUserMedia);

// @route   GET /api/media/ride/:rideId
// @desc    Get all media for a ride
// @access  Public
router.get("/ride/:rideId", mediaController.getRideMedia);

// @route   GET /api/media/:id
// @desc    Get a media by ID
// @access  Public
router.get("/:id", mediaController.getMediaById);

// @route   POST /api/media/upload
// @desc    Upload a new media file
// @access  Private
router.post(
  "/upload",
  protect,
  upload.single("media"), // 'media' is the field name in the form
  [
    body("mediaType")
      .isIn(["Photo", "Video"])
      .withMessage("Media type must be Photo or Video"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("rideId")
      .optional()
      .isMongoId()
      .withMessage("Valid ride ID is required if provided"),
  ],
  validate,
  mediaController.uploadMedia
);

// @route   DELETE /api/media/:id
// @desc    Delete a media
// @access  Private
router.delete("/:id", protect, mediaController.deleteMedia);

module.exports = router;
