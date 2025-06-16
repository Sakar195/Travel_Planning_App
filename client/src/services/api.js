// src/services/api.js
import axios from "axios";

// Determine the base URL for the API
// Use environment variable for production, default for development
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to potentially add the auth token to requests
// Note: The AuthContext handles setting the default Authorization header,
// so this interceptor is optional here but can be useful for other logic.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    console.log(
      `API Request: ${config.method.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );

    // Add detailed request logging
    console.log("Request Headers:", config.headers);

    if (config.data) {
      console.log("Request Payload:", JSON.stringify(config.data, null, 2));
    }

    if (token && !config.headers.Authorization) {
      // Add token if not already set by AuthContext
      // config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor to handle common responses or errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.status}]:`, response.config.url);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));
    // Simply return successful responses
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error(
      "API Error Response:",
      error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config.url,
            method: error.config.method,
          }
        : error.message
    );

    // Add more detailed error logging
    if (error.response) {
      console.error("Error Response Headers:", error.response.headers);
      console.error("Error Response Data:", error.response.data);

      if (error.response.status === 400) {
        console.error("Bad Request - Form Data Issues:", error.config?.data);
      }
    } else if (error.request) {
      console.error("No Response Received:", error.request);
    } else {
      console.error("Request Setup Error:", error.message);
    }

    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      console.error("API Error 401: Unauthorized", error.response.data);
      // Potentially trigger logout from AuthContext or redirect to login
      // For now, just logging it.
      // Example: If AuthContext's logout was accessible here, could call it.
      localStorage.removeItem("authToken");
      // Consider window.location.href = "/login"; if not using router navigation context here
    }
    // Return the error so components can handle specific error messages
    return Promise.reject(error);
  }
);

export default api;
