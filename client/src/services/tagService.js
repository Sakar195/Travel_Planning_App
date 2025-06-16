import api from "./api";

/**
 * Fetch all available tags from the backend.
 * @returns {Promise<Array>} List of tags (e.g., [{ _id: '1', name: 'scenic' }, ...])
 */
export const getAllTags = async () => {
  try {
    const response = await api.get("/tags"); // Assuming the endpoint is /api/tags
    // Ensure response is an array, default to empty array if not
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Get tags error:", error.response?.data || error.message);
    // Return empty array on error to prevent crashes in components
    return [];
  }
};
