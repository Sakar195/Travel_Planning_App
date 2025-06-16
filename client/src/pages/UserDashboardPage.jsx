// src/pages/UserDashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import "./UserDashboardPage.css"; // Create CSS for dashboard styling

// Reusable formatDate function (or move to a utils file)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
};

function UserDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelStates, setCancelStates] = useState({}); // { bookingId: { loading: false, error: '' } }
  // Function to fetch bookings

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous specific errors
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Could not load your bookings at this time."); // Generic error message
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []); // Empty dependency array - run once

  const handleCancelBooking = async (bookingId) => {
    // Prevent multiple clicks
    if (cancelStates[bookingId]?.loading) return;

    setCancelStates((prev) => ({
      ...prev,
      [bookingId]: { loading: true, error: "" },
    }));

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) {
      setCancelStates((prev) => ({
        ...prev,
        [bookingId]: { loading: false, error: "" },
      }));
      return;
    }

    try {
      await cancelBooking(bookingId);
      // Update the booking status locally or re-fetch all bookings
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );
      // Alternative: fetchBookings(); // Re-fetch the entire list
      setCancelStates((prev) => ({
        ...prev,
        [bookingId]: { loading: false, error: "" }, // Reset state on success
      }));
    } catch (err) {
      console.error(`Failed to cancel booking ${bookingId}:`, err);
      setCancelStates((prev) => ({
        ...prev,
        [bookingId]: {
          loading: false,
          error: err.message || "Cancellation failed.",
        },
      }));
    }
  };

  return (
    <div className="dashboard-container">
      <h1>My Dashboard</h1>
      <p>Welcome back, {user?.username || "Rider"}!</p>

      <section className="dashboard-section">
        <h2>My Bookings</h2>
        {loading && <p>Loading bookings...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <p>
            You haven't booked any trips yet.{" "}
            <Link to="/trips">Explore trips now!</Link>
          </p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <ul className="booking-list">
            {bookings.map((booking) => (
              <li
                key={booking._id}
                className={`booking-item status-${booking.status?.toLowerCase()}`}
              >
                <div className="booking-item-image">
                  <img
                    src={
                      booking.trip?.images && booking.trip.images.length > 0
                        ? `http://localhost:5001${booking.trip.images[0]}`
                        : "/placeholder-image.jpg"
                    }
                    alt={booking.trip?.title || "Trip image"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className="booking-item-details">
                  <h3>
                    <Link to={`/trips/${booking.trip?._id}`}>
                      {booking.trip?.title || "Trip details unavailable"}
                    </Link>
                  </h3>
                  <p>
                    <strong>Location:</strong> {booking.trip?.location || "N/A"}
                  </p>
                  <p>
                    <strong>Trip Date:</strong>{" "}
                    {formatDate(booking.trip?.startDate)}
                  </p>
                  <p>
                    <strong>Booked On:</strong>{" "}
                    {formatDate(booking.bookingDate)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="booking-status">{booking.status}</span>
                  </p>
                  {/* Show cancellation error for this specific booking */}
                  {cancelStates[booking._id]?.error && (
                    <p className="error-message cancellation-error">
                      {cancelStates[booking._id].error}
                    </p>
                  )}
                </div>
                <div className="booking-item-actions">
                  {booking.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="cancel-button"
                      disabled={cancelStates[booking._id]?.loading}
                    >
                      {cancelStates[booking._id]?.loading
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add other dashboard sections if needed (Profile, Uploads, etc.) */}
    </div>
  );
}

export default UserDashboardPage;
