// src/components/Auth/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  // Must be authenticated AND an admin to access
  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/" replace />;
  // Redirect non-admins to home or a "not authorized" page
}

export default AdminRoute;
