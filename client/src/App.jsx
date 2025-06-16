// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

// --- Layout Components ---
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import AdminLayout from "./components/Layout/AdminLayout";

// --- Page Components ---
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TripListPage from "./pages/TripListPage";
import TripDetailPage from "./pages/TripDetailPage";
import MyRideDetailPage from "./pages/MyRideDetailPage";
import ReservationPage from "./pages/ReservationPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import MyRidesPage from "./pages/MyRidesPage";
import MediaUploadPage from "./pages/MediaUploadPage";
import MediaGalleryPage from "./pages/MediaGalleryPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import CreateTripPage from "./pages/CreateTripPage";

// --- Admin Page Components ---
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import ManageTripsPage from "./pages/Admin/ManageTripsPage";
import ManageBookingsPage from "./pages/Admin/ManageBookingsPage";
import ManageUsersPage from "./pages/Admin/ManageUsersPage";
import ManageTagsPage from "./pages/Admin/ManageTagsPage";
import RidePlanningPage from "./pages/Admin/RidePlanningPage";

// --- Helper Components ---
import LoadingSpinner from "./components/Common/LoadingSpinner";

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while checking auth status
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- Admin Protected Route Component ---
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if authenticated AND user role is 'admin'
  return isAuthenticated && user?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/login" replace /> // Or redirect to an unauthorized page
  );
};

// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes WITH Navbar & Footer */}
          <Route
            element={
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <Outlet />
                </main>
                <Footer />
              </div>
            }
          >
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/trips" element={<TripListPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />

            {/* Protected Routes (Normal Users & Admins needing main layout) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Media Routes */}
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <MediaGalleryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media/upload"
              element={
                <ProtectedRoute>
                  <MediaUploadPage />
                </ProtectedRoute>
              }
            />
            {/* Route for ADMIN trip creation (uses old page for now) */}
            <Route
              path="/plan-ride" // Admin link still points here
              element={
                <AdminProtectedRoute>
                  <RidePlanningPage />
                </AdminProtectedRoute>
              }
            />
            {/* Route for USER trip planning (uses renamed component) */}
            <Route
              path="/plan-my-trip" // User link points here
              element={
                <ProtectedRoute>
                  <CreateTripPage />
                </ProtectedRoute>
              }
            />
            {/* Route for USER to see their created trips */}
            <Route
              path="/my-rides"
              element={
                <ProtectedRoute>
                  <MyRidesPage />
                </ProtectedRoute>
              }
            />
            {/* ADDED: Route for USER to see a specific created trip detail */}
            <Route
              path="/my-rides/:id"
              element={
                <ProtectedRoute>
                  <MyRideDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-reservation/:tripId?"
              element={
                <ProtectedRoute>
                  <ReservationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="manage-trips" element={<ManageTripsPage />} />
            <Route path="add-trip" element={<RidePlanningPage />} />
            <Route path="edit-trip/:tripId" element={<RidePlanningPage />} />
            <Route path="manage-bookings" element={<ManageBookingsPage />} />
            <Route path="manage-users" element={<ManageUsersPage />} />
            <Route path="manage-tags" element={<ManageTagsPage />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
