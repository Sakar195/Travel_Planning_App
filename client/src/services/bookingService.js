// src/services/bookingService.js
import api from "./api";

/**
 * Initiate a booking and get payment details
 * @param {Object} bookingData - Booking information including tripId, numberOfPersons, totalAmount, etc.
 * @returns {Promise<Object>} Booking initiation response (might include payment URL)
 */
export const initiateBooking = async (bookingData) => {
  try {
    // Use the correct endpoint: /initiate
    const response = await api.post("/v1/bookings/initiate", bookingData);
    return response.data;
  } catch (error) {
    console.error(
      "Booking initiation error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to initiate booking");
  }
};

/**
 * Get all bookings for the authenticated user
 * @returns {Promise<Array>} List of bookings
 */
export const getMyBookings = async () => {
  try {
    const response = await api.get("/v1/bookings/my-bookings");
    return response.data;
  } catch (error) {
    console.error(
      "Get my bookings error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch your bookings");
  }
};

/**
 * Get a specific booking by ID
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/v1/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Get booking error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch booking details");
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId - The ID of the booking to cancel
 * @returns {Promise<Object>} Updated booking data with cancelled status
 */
export const cancelBooking = async (bookingId) => {
  try {
    // Use PUT request to update the booking status to cancelled
    const response = await api.put(`/v1/bookings/${bookingId}/cancel`);
    console.log("Booking cancellation response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to cancel booking");
  }
};

// Add getAllBookings (for admin) if needed
