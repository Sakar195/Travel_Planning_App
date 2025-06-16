// server/controllers/mediaController.js
const mediaService = require("../services/mediaService");
const fs = require("fs");
const path = require("path");

/**
 * Upload a new media file
 * @route POST /api/media/upload
 * @access Private
 */
const uploadMedia = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { mediaType, description, rideId } = req.body;
    const mediaUrl = `/uploads/${req.file.filename}`;

    // Create media entry
    const mediaData = {
      userId: req.user.id,
      mediaType,
      mediaUrl,
      description,
    };

    // Add rideId if provided
    if (rideId) {
      mediaData.rideId = rideId;
    }

    const media = await mediaService.saveMedia(mediaData);
    res.status(201).json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all media for the authenticated user
 * @route GET /api/media/user
 * @access Private
 */
const getUserMedia = async (req, res, next) => {
  try {
    const media = await mediaService.getUserMedia(req.user.id);
    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all media for a ride
 * @route GET /api/media/ride/:rideId
 * @access Public
 */
const getRideMedia = async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    const media = await mediaService.getRideMedia(rideId);
    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific media by ID
 * @route GET /api/media/:id
 * @access Public
 */
const getMediaById = async (req, res, next) => {
  try {
    const mediaId = req.params.id;
    const media = await mediaService.getMediaById(mediaId);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a media
 * @route DELETE /api/media/:id
 * @access Private
 */
const deleteMedia = async (req, res, next) => {
  try {
    const mediaId = req.params.id;

    // First check if media exists
    const media = await mediaService.getMediaById(mediaId);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Check if user is authorized to delete this media
    if (!media.userId || media.userId._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this media" });
    }

    // Delete the media from database
    await mediaService.deleteMedia(mediaId);

    // Try to delete the file from the server
    if (media.mediaUrl) {
      // Extract file name from URL
      const filename = media.mediaUrl.split("/").pop();
      const filePath = path.join(process.cwd(), "uploads", filename);

      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(200).json({
            message: "Media deleted successfully but file removal failed",
            error: err.message,
          });
        }

        res.status(200).json({ message: "Media deleted successfully" });
      });
    } else {
      res.status(200).json({ message: "Media deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMedia,
  getUserMedia,
  getRideMedia,
  getMediaById,
  deleteMedia,
};
