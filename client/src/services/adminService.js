// src/services/adminService.js
import api from "./api";

// --- Trip Management ---

export const adminGetAllTrips = async () => {
  // Fetch ALL trips for the main admin management view (removed isPublic filter)
  try {
    // Remove ?isPublic=true filter to get all trips
    const response = await api.get("/trips"); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(
      "Admin Get trips error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch trips");
  }
};

// createTrip service already handles FormData (in tripService.js)

export const adminUpdateTrip = async (tripId, tripData) => {
  // Note: This simple version doesn't handle image updates via PUT
  // You'd typically use POST with method override or a dedicated image update endpoint
  try {
    // If sending JSON data only (no file uploads)
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data;
  } catch (error) {
    console.error(
      "Admin Update trip error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to update trip");
  }
};

export const adminDeleteTrip = async (tripId) => {
  try {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data; // { msg: 'Trip removed...' }
  } catch (error) {
    console.error(
      "Admin Delete trip error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to delete trip");
  }
};

// --- Tag Management ---

export const adminGetAllTags = async () => {
  try {
    const response = await api.get("/tags");
    return response.data;
  } catch (error) {
    console.error(
      "Admin Get Tags error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch tags");
  }
};

export const adminAddTag = async (tagData) => {
  // Ensure we only send the name and description fields
  const { name, description } = tagData;

  try {
    // Corrected endpoint: POST /tags/admin
    const response = await api.post("/tags/admin", { name, description });
    return response.data;
  } catch (error) {
    console.error(
      "Admin Add Tag error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to add tag");
  }
};

export const adminUpdateTag = async (tagId, tagData) => {
  // Ensure we only send the name and description fields
  const { name, description } = tagData;

  try {
    const response = await api.put(`/tags/${tagId}`, { name, description });
    return response.data;
  } catch (error) {
    console.error(
      "Admin Update Tag error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to update tag");
  }
};

export const adminDeleteTag = async (tagId) => {
  try {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Admin Delete Tag error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to delete tag");
  }
};

// --- Booking Management ---

export const adminGetAllBookings = async (
  page = 1,
  limit = 10,
  status = null
) => {
  try {
    // Add /v1 prefix
    let url = `/v1/bookings/admin/all?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(
      "Admin Get Bookings error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch bookings");
  }
};

export const adminUpdateBookingStatus = async (bookingId, status) => {
  try {
    // Add /v1 prefix (Assuming this route also needs it)
    const response = await api.put(`/v1/bookings/${bookingId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Admin Update Booking Status error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to update booking status");
  }
};

// cancelBooking service already allows admin cancellation (in bookingService.js)

// Admin: Cancel a booking
export const adminCancelBooking = async (bookingId) => {
  try {
    // Add /v1 prefix
    const response = await api.put(`/v1/bookings/admin/cancel/${bookingId}`);
    return response.data; // Returns the updated booking
  } catch (error) {
    console.error(
      "Admin Cancel Booking error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to cancel booking");
  }
};

// --- User Management ---

export const adminGetAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error(
      "Admin Get Users error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch users");
  }
};

export const adminGetUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Admin Get User Detail error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch user details");
  }
};

export const adminUpdateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(
      "Admin Update User error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to update user");
  }
};

export const adminDeleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data; // { msg: 'User removed' }
  } catch (error) {
    console.error(
      "Admin Delete User error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to delete user");
  }
};

// Add User (Admin)
export const adminAddUser = async (userData) => {
  try {
    // Call the dedicated admin endpoint for creating users
    const response = await api.post("/users/admin/create", userData);
    return response.data; // Returns the created user object (without password)
  } catch (error) {
    console.error(
      "Admin Add User error:",
      error.response?.data || error.message
    );
    // Throw the specific error message from the backend if available
    throw error.response?.data || new Error("Failed to add user");
  }
};
