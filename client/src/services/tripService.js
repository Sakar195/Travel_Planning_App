// src/services/tripService.js
import api from "./api";

/**
 * Get all trips with optional filtering
 * @param {Object} filters - Optional filter parameters (location, tags, etc)
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Number of items per page
 * @returns {Promise<Array>} List of trips
 */
export const getAllTrips = async (filters = {}, page = 1, limit = 10) => {
  try {
    // Convert filters to query params
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters,
    }).toString();
    const response = await api.get(`/trips?${queryParams}`);

    // Normalize trips with currency format
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeTrip);
    }

    return response.data;
  } catch (error) {
    console.error("Get trips error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch trips");
  }
};

/**
 * Get a specific trip by ID
 * @param {string} tripId - The ID of the trip
 * @returns {Promise<Object>} Trip details
 */
export const getTripById = async (tripId) => {
  try {
    console.log(`Making API request to fetch trip with ID: ${tripId}`);

    // Try with direct ID first
    try {
      const response = await api.get(`/trips/${tripId}`);

      // Handle successful response
      if (response.data) {
        console.log(`API response for trip ${tripId}:`, response);

        // Sometimes the API might wrap the result in a "data" property
        const tripData = response.data.data || response.data;

        // Check if the response is empty or invalid
        if (!tripData || Object.keys(tripData).length === 0) {
          throw new Error("Trip not found");
        }

        // Normalize trip data
        return normalizeTrip(tripData);
      }
    } catch (error) {
      // If error is not 404, rethrow it immediately
      if (!error.response || error.response.status !== 404) {
        throw error;
      }

      console.log(`Trip not found with direct ID. Trying alternate format...`);

      // If 404, try with rideId query parameter (for UUID formatted IDs)
      const altResponse = await api.get(`/trips?rideId=${tripId}`);

      if (
        altResponse.data &&
        Array.isArray(altResponse.data) &&
        altResponse.data.length > 0
      ) {
        console.log(
          `Found trip via rideId query parameter:`,
          altResponse.data[0]
        );
        return normalizeTrip(altResponse.data[0]);
      }

      // If we got here, both attempts failed
      throw new Error("Trip not found with either ID format");
    }
  } catch (error) {
    // Enhanced error logging
    if (error.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // If server returns 404, throw a user-friendly error
      if (error.response.status === 404) {
        throw new Error("Trip not found");
      }
    } else if (error.request) {
      console.error("API Request Error (No Response):", error.request);
      throw new Error("Server did not respond. Please check your connection.");
    } else {
      console.error("API Error:", error.message);
    }

    throw error.response?.data?.message
      ? new Error(error.response.data.message)
      : new Error(`Failed to fetch trip details: ${error.message}`);
  }
};

/**
 * Normalize trip data for consistent format across the application
 * @param {Object} tripData - Raw trip data from API
 * @returns {Object} Normalized trip data
 */
const normalizeTrip = (tripData) => {
  // Create a new object with all the original properties
  return {
    ...tripData,
    // Ensure these properties exist for UI rendering
    image: tripData.image || tripData.images?.[0] || null,
    difficulty: tripData.difficulty || "Not specified",
    durationDays: tripData.durationDays || parseInt(tripData.duration) || null,
    price: tripData.price || null,
    // Add any other normalizations here
    currency: "Rs", // Set currency to Rs for all trips
  };
};

/**
 * Create a new trip
 * @param {Object} tripData - Trip data
 * @returns {Promise<Object>} Created trip
 */
export const createTrip = async (tripData) => {
  try {
    const response = await api.post("/trips", tripData);
    return normalizeTrip(response.data);
  } catch (error) {
    console.error("Create trip error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create trip");
  }
};

/**
 * Update an existing trip
 * @param {string} tripId - The ID of the trip to update
 * @param {Object} tripData - Updated trip data
 * @returns {Promise<Object>} Updated trip
 */
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return normalizeTrip(response.data);
  } catch (error) {
    console.error("Update trip error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to update trip");
  }
};

/**
 * Delete a trip
 * @param {string} tripId - The ID of the trip to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTrip = async (tripId) => {
  try {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("Delete trip error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to delete trip");
  }
};

/**
 * Get public trips (typically for browsing/exploration)
 * Uses the default filtering of getAllTrips which should be isPublic: true
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Number of items per page
 * @returns {Promise<Array>} List of public trips
 */
export const getPublicTrips = async (page = 1, limit = 9) => {
  try {
    // We rely on the backend defaulting to isPublic: true
    const queryParams = new URLSearchParams({
      page,
      limit, // Default to 9 for a 3x3 grid perhaps?
      sortBy: 'createdAt', // Optional: default sort
      sortOrder: 'desc',
    }).toString();

    const response = await api.get(`/trips?${queryParams}`);

    // Normalize trips
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeTrip);
    }
    console.warn("API response for public trips was not an array:", response.data);
    return []; // Return empty array if response is not as expected

  } catch (error) {
    console.error("Get public trips error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch public trips");
  }
};

/**
 * Get trips created by the currently logged-in user
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Number of items per page
 * @returns {Promise<Array>} List of the user's trips
 */
export const getMyTrips = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({ page, limit }).toString();
    // Calls the new backend endpoint, assumes API client handles auth token
    const response = await api.get(`/trips/my-trips?${queryParams}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeTrip); // Reuse normalization
    }
    console.warn("API response for my trips was not an array:", response.data);
    return [];
  } catch (error) {
    console.error("Get my trips error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch your trips");
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of File objects to upload
 * @returns {Promise<string[]>} Array of URLs for the uploaded images
 */
export const uploadImages = async (files) => {
  if (!files || files.length === 0) {
    return []; // No files to upload
  }

  const formData = new FormData();
  files.forEach((file) => {
    // Use a consistent field name, e.g., 'images'
    // The backend endpoint must be configured to handle multiple files under this name
    formData.append("images", file);
  });

  try {
    // IMPORTANT: The API endpoint '/upload/images' must be implemented on the server
    // to handle multipart/form-data uploads and return image URLs.
    const response = await api.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Assuming the server responds with { urls: ['url1', 'url2', ...] }
    if (response.data && Array.isArray(response.data.urls)) {
      return response.data.urls;
    } else {
      console.error(
        "Image upload API response format unexpected:",
        response.data
      );
      throw new Error("Server did not return expected image URLs.");
    }
  } catch (error) {
    console.error("Image upload error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to upload images");
  }
};
