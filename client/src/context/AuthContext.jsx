// src/context/AuthContext.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true); // Loading state to check initial auth status

  useEffect(() => {
    // Function to verify token and fetch user data on initial load or token change
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("authToken");
      console.log(
        "🔐 Checking stored auth token:",
        storedToken ? "Found token" : "No token found"
      );

      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        console.log("🔄 Set Authorization header for API requests");

        try {
          // Assuming you have a '/api/users/profile' endpoint protected by 'protect' middleware
          console.log("🔍 Attempting to verify token by fetching user profile");
          const response = await api.get("/users/profile");
          console.log("✅ User verification successful:", response.data);
          setUser(response.data); // Assuming user data is in response.data
        } catch (error) {
          console.error(
            "❌ Auth Error:",
            error.response ? error.response.data : error.message
          );
          console.log("🗑️ Removing invalid token from storage");
          // Token might be invalid or expired
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common["Authorization"];
        }
      } else {
        // No token found
        console.log("👤 No auth token, user is not authenticated");
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, []); // Run only once on mount to check initial token

  const login = (newToken, userData) => {
    console.log("🔐 Login function called with token and user data");
    console.log("👤 User data:", JSON.stringify(userData, null, 2));

    if (!newToken) {
      console.error("❌ Login called with empty token!");
      return;
    }

    localStorage.setItem("authToken", newToken);
    console.log("💾 Token saved to localStorage");

    setToken(newToken);
    setUser(userData);

    // Set the Authorization header for all future API requests
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    console.log("🔄 Set Authorization header for API requests");

    console.log("✅ Login process completed successfully");
  };

  const logout = () => {
    console.log("🚪 Logout function called");
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    console.log("✅ User logged out successfully");
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
