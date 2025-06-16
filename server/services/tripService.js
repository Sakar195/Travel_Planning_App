const Trip = require("../models/Trip");

/**
 * Save a new trip to the database
 * @param {Object} tripData - Trip data to be saved
 * @returns {Promise<Object>} Created trip
 */
const saveTrip = async (tripData) => {
  try {
    const trip = await Trip.create(tripData);
    return trip;
  } catch (error) {
    throw error;
  }
};

/**
 * Find trips based on filters
 * @param {Object} filters - Filter criteria (optional)
 * @param {Number} page - Page number for pagination (optional, default: 1)
 * @param {Number} limit - Number of items per page (optional, default: 10)
 * @param {String} sortBy - Field to sort by (optional, default: 'createdAt')
 * @param {String} sortOrder - Sort order ('asc' or 'desc', default: 'desc')
 * @returns {Promise<Array>} Array of trips
 */
const findTrips = async (
  filters = {},
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc"
) => {
  try {
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const trips = await Trip.find(filters)
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return trips;
  } catch (error) {
    throw error;
  }
};

/**
 * Find a trip by ID
 * @param {String} tripId - Trip ID to find
 * @returns {Promise<Object|null>} Trip or null if not found
 */
const findTrip = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);
    return trip;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a trip by ID
 * @param {String} tripId - Trip ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated trip or null if not found
 */
const updateTrip = async (tripId, updateData) => {
  try {
    const trip = await Trip.findByIdAndUpdate(tripId, updateData, {
      new: true,
      runValidators: true,
    });
    return trip;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a trip by ID
 * @param {String} tripId - Trip ID to remove
 * @returns {Promise<Object|null>} Removed trip or null if not found
 */
const removeTrip = async (tripId) => {
  try {
    const trip = await Trip.findByIdAndDelete(tripId);
    return trip;
  } catch (error) {
    throw error;
  }
};

/**
 * Find trips created by a specific user
 * @param {String} userId - The ID of the user
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Number of items per page
 * @returns {Promise<Array>} Array of trips created by the user
 */
const findTripsByCreator = async (userId, page = 1, limit = 10) => {
  try {
    const trips = await Trip.find({ creatorId: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
    return trips;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveTrip,
  findTrips,
  findTrip,
  updateTrip,
  removeTrip,
  findTripsByCreator,
};
