import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyTrips, deleteTrip } from "../services/tripService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatters";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import Pagination from "../components/Common/Pagination";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const MyRidesPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const tripsPerPage = 6;
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        // If user is not available, abort
        if (!user || !user._id) {
          setLoading(false);
          return;
        }
        // Pass the current page number to the API, not the user ID
        const response = await getMyTrips(currentPage, tripsPerPage);

        // Make sure trips is always an array
        const tripsData = Array.isArray(response) ? response : [];
        setTrips(tripsData);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Failed to load your trips. Please try again later.");
        toast.error("Failed to load your trips.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user, currentPage]); // Add currentPage as a dependency to refetch when page changes

  // Logic for pagination - safely handle the case when trips is undefined or empty
  const currentTrips =
    trips && trips.length > 0 ? trips.slice(0, tripsPerPage) : [];

  const totalPages =
    trips && trips.length > 0 ? Math.ceil(trips.length / tripsPerPage) : 1;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (e, tripId) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent card click

    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    setDeletingId(tripId);
    try {
      await deleteTrip(tripId);
      setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== tripId));
      toast.success("Trip deleted successfully!");
    } catch (err) {
      console.error("Error deleting trip:", err);
      setError("Failed to delete trip. Please try again.");
      toast.error("Failed to delete trip.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          You don't have any trips yet
        </h2>
        <p className="text-gray-600 mb-6">
          Start planning your next adventure today!
        </p>
        <Link
          to="/plan-my-trip"
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg 
                                shadow-md hover:shadow-lg hover:from-sky-600 hover:to-cyan-600 transition duration-300 
                                transform hover:-translate-y-1"
        >
          Create a Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Trips</h1>
        <p className="text-gray-600">
          View and manage all your personal trip plans.
        </p>
      </div>

      {/* Grid layout for trip cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTrips.map((trip) => (
          <div
            key={trip._id || trip.rideId || Math.random().toString()}
            className="relative group"
          >
            <Link to={`/trips/${trip._id || trip.rideId}`} className="block">
              <div
                className="bg-white rounded-xl shadow-md overflow-hidden h-full
                                      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      trip.images?.[0] ||
                      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop"
                    }
                    alt={trip.title || "Trip"}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold 
                                                    ${
                                                      trip.isPublic
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                    >
                      {trip.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {trip.title || "Untitled Trip"}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {trip.description || "No description available"}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 text-sky-500" />
                      <span className="text-sm">
                        {trip.location?.name || "No location specified"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2 text-sky-500" />
                      <span className="text-sm">
                        {formatDate(trip.startDate) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-sky-500" />
                      <span className="text-sm">
                        {trip.durationDays || "?"}{" "}
                        {trip.durationDays === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </div>

                  {trip.tags && trip.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {trip.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-sky-50 text-sky-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {trip.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{trip.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Created: {formatDate(trip.createdAt) || "Unknown"}
                    </span>
                    <span className="text-sm font-medium text-sky-600 group-hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            {/* Delete Button */}
            <button
              onClick={(e) => handleDelete(e, trip._id)} // Pass trip ID
              disabled={deletingId === trip._id}
              className={`absolute top-3 left-3 p-1.5 rounded-full bg-red-500 text-white 
                                      hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                                      transition-all duration-200 ease-in-out 
                                      disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Delete Trip"
            >
              {deletingId === trip._id ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {trips.length > tripsPerPage && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MyRidesPage;
