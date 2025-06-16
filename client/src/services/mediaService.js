import api from "./api";

/**
 * Upload media file (photo or video)
 * @param {FormData} formData - Form data with media file and metadata
 * @returns {Promise<Object>} Uploaded media data
 */
export const uploadMedia = async (formData) => {
  try {
    const response = await api.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Media upload error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to upload media");
  }
};

/**
 * Get all media uploaded by the current user
 * @returns {Promise<Array>} List of media items
 */
export const getUserMedia = async () => {
  try {
    const response = await api.get("/media/user");
    return response.data;
  } catch (error) {
    console.error(
      "Get user media error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch your media");
  }
};

/**
 * Get all media for a specific ride/trip
 * @param {string} rideId - The ID of the ride
 * @returns {Promise<Array>} List of media items for this ride
 */
export const getRideMedia = async (rideId) => {
  try {
    const response = await api.get(`/media/ride/${rideId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get ride media error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch ride media");
  }
};

/**
 * Get a specific media item by its ID
 * @param {string} mediaId - The ID of the media item
 * @returns {Promise<Object>} Media item data
 */
export const getMediaById = async (mediaId) => {
  try {
    const response = await api.get(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error("Get media error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch media");
  }
};

/**
 * Delete a media item
 * @param {string} mediaId - The ID of the media to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteMedia = async (mediaId) => {
  try {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error("Delete media error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to delete media");
  }
};
