import axios from 'axios';

// Use an explicit base URL instead of relying on process.env
const API_URL = 'http://localhost:5001';

/**
 * Create a new ride plan
 * @param {Object} ridePlanData - The ride plan data
 * @returns {Promise<Object>} The created ride plan
 */
export const createRidePlan = async (ridePlanData) => {
  try {
    console.log('Creating ride plan with data:', ridePlanData);
    const response = await axios.post(`${API_URL}/api/ride-plans`, ridePlanData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true // If using HTTP-only cookies for auth
    });
    console.log('Ride plan created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating ride plan:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create ride plan');
  }
};

/**
 * Get all ride plans for the current user
 * @returns {Promise<Array>} Array of ride plans
 */
export const getMyRidePlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/ride-plans`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ride plans:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch ride plans');
  }
};

/**
 * Get a specific ride plan by ID
 * @param {string} id - The ride plan ID
 * @returns {Promise<Object>} The ride plan data
 */
export const getRidePlanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/ride-plans/${id}`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ride plan ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch ride plan');
  }
};

/**
 * Update an existing ride plan
 * @param {string} id - The ride plan ID
 * @param {Object} updateData - The updated ride plan data
 * @returns {Promise<Object>} The updated ride plan
 */
export const updateRidePlan = async (id, updateData) => {
  try {
    const response = await axios.put(`${API_URL}/api/ride-plans/${id}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating ride plan ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update ride plan');
  }
};

/**
 * Delete a ride plan
 * @param {string} id - The ride plan ID
 * @returns {Promise<void>}
 */
export const deleteRidePlan = async (id) => {
  try {
    await axios.delete(`${API_URL}/api/ride-plans/${id}`, {
      withCredentials: true
    });
  } catch (error) {
    console.error(`Error deleting ride plan ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete ride plan');
  }
};

export default {
  createRidePlan,
  getMyRidePlans,
  getRidePlanById,
  updateRidePlan,
  deleteRidePlan
}; 