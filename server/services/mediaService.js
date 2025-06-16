const Image = require("../models/Image");

/**
 * Save a new media entry
 * @param {Object} mediaData - Media data to be saved
 * @returns {Promise<Object>} Created media
 */
const saveMedia = async (mediaData) => {
  try {
    const media = await Image.create(mediaData);
    return media;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all media for a user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} List of media
 */
const getUserMedia = async (userId) => {
  try {
    const media = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .populate("rideId", "title location")
      .exec();
    return media;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all media for a ride
 * @param {String} rideId - Ride ID
 * @returns {Promise<Array>} List of media
 */
const getRideMedia = async (rideId) => {
  try {
    const media = await Image.find({ rideId })
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName username profilePicture")
      .exec();
    return media;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a media by ID
 * @param {String} mediaId - Media ID
 * @returns {Promise<Object|null>} Media or null if not found
 */
const getMediaById = async (mediaId) => {
  try {
    const media = await Image.findById(mediaId)
      .populate("userId", "firstName lastName username profilePicture")
      .populate("rideId", "title location")
      .exec();
    return media;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a media by ID
 * @param {String} mediaId - Media ID to delete
 * @returns {Promise<Object|null>} Deleted media or null if not found
 */
const deleteMedia = async (mediaId) => {
  try {
    const media = await Image.findByIdAndDelete(mediaId);
    return media;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveMedia,
  getUserMedia,
  getRideMedia,
  getMediaById,
  deleteMedia,
};
