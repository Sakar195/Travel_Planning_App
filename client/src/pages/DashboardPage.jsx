import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import ErrorMessage from "../components/Common/ErrorMessage";
import {
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  TicketIcon,
  PhotoIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Helper to format status
const formatStatus = (status) => {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return; // Don't fetch if user isn't loaded

      setLoadingBookings(true);
      setBookingError(null);
      try {
        console.log("Fetching user bookings for dashboard...");
        const data = await getMyBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching user bookings:", err);
        setBookingError(
          err.message || "Failed to fetch your bookings. Please try again."
        );
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchUserBookings();
  }, [user]); // Refetch if user changes

  // Combine auth loading and booking loading
  const isLoading = authLoading || loadingBookings;

  // Dynamic stats based on fetched data
  const statsData = [
    {
      label: "Total Bookings",
      value: bookings.length.toString(),
      icon: <TicketIcon className="h-5 w-5" />,
      color: "bg-sky-100 text-sky-600",
    },
    {
      label: "Confirmed Trips",
      value: bookings.filter((b) => b.status === "confirmed").length.toString(),
      icon: <MapPinIcon className="h-5 w-5" />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pending Bookings",
      value: bookings.filter((b) => b.status === "pending").length.toString(),
      icon: <CalendarIcon className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Total Spent (Approx)", // Example stat - might need actual transaction data
      value: `Rs ${bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        .toLocaleString()}`,
      icon: <ChartBarIcon className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // --- Cancel Booking Handler ---
  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingBookingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      toast.error(`Failed to cancel booking: ${err.message || "Server error"}`);
      console.error("Cancellation error:", err);
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user && !authLoading) {
    // Show login prompt only after auth check is complete
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center animate-fade-in">
          <div className="bg-sky-100 p-4 rounded-full inline-flex mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-[var(--color-primary)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--color-txt-primary)]">
            Account Required
          </h2>
          <p className="text-[var(--color-txt-secondary)] mb-6 max-w-md mx-auto">
            Please sign in to view your dashboard and manage your cycling
            adventures.
          </p>
          <Button size="large">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // If user is loaded but an error occurred fetching bookings
  if (user && bookingError) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[50vh]">
        <ErrorMessage message={bookingError} />
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container bg-[var(--color-bg-light)] py-8">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
              Welcome, {user.username || user.fullname || "Rider"}!
            </h1>
            <p className="text-[var(--color-txt-secondary)] mt-2">
              Here's an overview of your cycling activity and upcoming
              adventures.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            <Button
              variant="secondary"
              icon={<PhotoIcon className="h-5 w-5" />}
            >
              <Link to="/media">View Media</Link>
            </Button>
            <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />}>
              <Link to="/plan-my-trip">Create Ride Plan</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section - Now Dynamic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-full mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-txt-primary)]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--color-txt-tertiary)]">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* My Bookings Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card
          className="animate-slide-up hover:shadow-[var(--shadow-lg)]"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-txt-primary)] flex items-center">
              <TicketIcon className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
              My Bookings
            </h2>
            <Badge variant="primary">{bookings.length}</Badge>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="p-3 rounded-lg border border-[var(--color-border)] hover:bg-sky-50/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <Link
                        to={`/trips/${booking.tripId?._id}`}
                        className="font-medium text-[var(--color-txt-primary)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        {booking.tripId?.title || "Trip Details Unavailable"}
                      </Link>
                      <p className="text-sm text-[var(--color-txt-tertiary)]">
                        Booked: {formatDate(booking.bookingDate)} | Start:
                        {formatDate(booking.tripId?.startDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "success"
                            : booking.status === "pending"
                            ? "warning"
                            : booking.status === "cancelled"
                            ? "neutral"
                            : "danger"
                        }
                      >
                        {formatStatus(booking.status)}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700">
                        Rs {booking.totalAmount?.toLocaleString() || "N/A"}
                      </span>
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingBookingId === booking._id}
                          className={`text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium inline-flex items-center p-1 rounded hover:bg-red-50`}
                          title="Cancel Booking"
                        >
                          {cancellingBookingId === booking._id ? (
                            <LoadingSpinner size="small" className="w-4 h-4" />
                          ) : (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Cancel
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--color-txt-tertiary)] italic mb-4">
                You haven't made any bookings yet.
              </p>
              <Button variant="outline" size="small">
                <Link to="/trips">Explore Trips</Link>
              </Button>
            </div>
          )}

          {bookings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-right">
              <Link
                to="/profile"
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] text-sm font-medium inline-flex items-center transition-colors"
              >
                Manage All Bookings
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
