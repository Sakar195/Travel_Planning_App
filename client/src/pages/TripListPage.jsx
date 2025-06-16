// src/pages/TripListPage.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  TagIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Enhanced Trip Card Component
const TripCard = ({ trip }) => {
  // Correctly construct the image URL
  const serverBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
  let imageUrl;

  if (trip.images && trip.images.length > 0) {
    const imagePath = trip.images[0];
    // Check if imagePath already starts with http (absolute URL)
    if (imagePath.startsWith("http")) {
      imageUrl = imagePath;
    } else {
      // Prepend server base URL if it's a relative path
      imageUrl = `${serverBaseUrl}${
        imagePath.startsWith("/") ? "" : "/"
      }${imagePath}`;
    }
  } else if (trip.image) {
    const imagePath = trip.image;
    if (imagePath.startsWith("http")) {
      imageUrl = imagePath;
    } else {
      imageUrl = `${serverBaseUrl}${
        imagePath.startsWith("/") ? "" : "/"
      }${imagePath}`;
    }
  } else {
    imageUrl = "/placeholder-image.jpg"; // Default placeholder if no image
  }

  // Define difficulty color
  const difficultyColor =
    {
      Easy: "bg-green-100 text-green-800",
      Moderate: "bg-yellow-100 text-yellow-800",
      Hard: "bg-red-100 text-red-800",
    }[trip.difficulty] || "bg-gray-100 text-gray-800";

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl bg-white border border-gray-100">
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const placeholderUrl = "/placeholder-image.jpg";
            if (e.target.src !== placeholderUrl) {
              console.warn(
                `Failed to load image: ${e.target.src}. Falling back to placeholder.`
              );
              e.target.onerror = null; // Prevent infinite loops
              e.target.src = placeholderUrl;
            }
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center font-medium text-xs px-2.5 py-0.5 rounded-full shadow-sm ${difficultyColor}`}
          >
            {trip.difficulty || "Moderate"}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
            {trip.title}
          </h3>
          <span className="text-sm font-medium text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
            {trip.currency || "Rs"} {trip.pricePerPerson || "Free"}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>

        {/* Trip details in grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-sky-500 flex-shrink-0" />
            <span className="truncate">
              {trip.location?.name || "Location"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-1.5 text-sky-500 flex-shrink-0" />
            <span>
              {trip.durationDays
                ? `${trip.durationDays} ${
                    trip.durationDays === 1 ? "day" : "days"
                  }`
                : trip.duration
                ? trip.duration
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ArrowsRightLeftIcon className="h-4 w-4 mr-1.5 text-sky-500 flex-shrink-0" />
            <span>{trip.distance ? `${trip.distance} km` : "N/A"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UserGroupIcon className="h-4 w-4 mr-1.5 text-sky-500 flex-shrink-0" />
            <span>{trip.maxParticipants || "10"} spots</span>
          </div>
        </div>

        {/* Extra details */}
        {(trip.terrain || trip.transportType) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {trip.terrain && (
              <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                <TagIcon className="h-3 w-3 mr-1" />
                {trip.terrain}
              </span>
            )}
            {trip.transportType && (
              <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {trip.transportType}
              </span>
            )}
            {trip.bestSeason && (
              <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {trip.bestSeason}
              </span>
            )}
          </div>
        )}

        {/* Trip route */}
        {(trip.startLocation || trip.endLocation || trip.location?.name) && (
          <div className="flex items-center mb-4 text-sm">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-sky-500 flex-shrink-0" />
            <div className="flex items-center truncate">
              <span className="text-gray-800 font-medium truncate">
                {trip.startLocation || trip.location?.name || "Starting Point"}
              </span>
              {trip.endLocation && (
                <>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="text-gray-800 font-medium truncate">
                    {trip.endLocation}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          fullWidth
          className="transition-all duration-300 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 shadow-sm hover:shadow"
        >
          <Link
            to={`/trips/${trip._id}`}
            className="flex items-center justify-center"
          >
            View Details
            <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

const TripListPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    difficulty: "",
    duration: "",
    distance: "",
    transportType: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/trips?isPublic=true");
        setTrips(response.data || []);
      } catch (err) {
        setError("Failed to fetch trips. Please try again later.");
        console.error("Fetch trips error:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // Skip empty filters

      // Handle each filter type separately
      switch (key) {
        case "difficulty":
          // Direct match on difficulty if it exists
          return !trip.difficulty || trip.difficulty === value;

        case "duration":
          // Convert duration filter to check against durationDays
          if (!trip.durationDays) return true;

          if (value === "1 day") {
            return trip.durationDays === 1;
          } else if (value === "2-3 days") {
            return trip.durationDays >= 2 && trip.durationDays <= 3;
          } else if (value === "4+ days") {
            return trip.durationDays >= 4;
          }
          return true;

        case "distance":
          // We don't have a direct distance field in our model yet
          // For now, just pass this filter (always true)
          return true;

        case "transportType":
          // Direct match on transportType if it exists
          return !trip.transportType || trip.transportType === value;

        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const clearFilters = () => {
    setFilters({
      difficulty: "",
      duration: "",
      distance: "",
      transportType: "",
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
        {/* Background pattern decorations */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-white/20 transform -skew-y-3"></div>
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
              Discover Amazing Adventures
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Explore curated routes, join group journeys, and create
              unforgettable adventures.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Available Trips
            </h2>
            <Button
              variant="outline"
              className="shadow-sm hover:shadow transition-all duration-300 hover:bg-sky-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <>
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Hide Filters
                </>
              ) : (
                <>
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Show Filters
                </>
              )}
            </Button>
          </div>

          {showFilters && (
            <Card className="mb-6 p-4 shadow-md border border-gray-100 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) =>
                      setFilters({ ...filters, difficulty: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Beginner-Friendly</option>
                    <option value="Moderate">Intermediate</option>
                    <option value="Hard">Experienced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) =>
                      setFilters({ ...filters, duration: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Any Duration</option>
                    <option value="1 day">1 Day</option>
                    <option value="2-3 days">2-3 Days</option>
                    <option value="4+ days">4+ Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance
                  </label>
                  <select
                    value={filters.distance}
                    onChange={(e) =>
                      setFilters({ ...filters, distance: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Any Distance</option>
                    <option value="<50km">Under 50km</option>
                    <option value="50-100km">50-100km</option>
                    <option value="100+km">100+km</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Type
                  </label>
                  <select
                    value={filters.transportType || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, transportType: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Any Type</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>
              {(filters.difficulty ||
                filters.duration ||
                filters.distance ||
                filters.transportType ||
                searchQuery) && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="text"
                    onClick={clearFilters}
                    className="text-sky-600 hover:text-sky-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Trip List */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip._id || trip.rideId} trip={trip} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 shadow-md bg-white border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="bg-sky-100 p-4 rounded-full inline-flex mb-4">
                <MapPinIcon className="h-8 w-8 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Trips Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || Object.values(filters).some(Boolean)
                  ? "Try adjusting your search or filters"
                  : "There are currently no trips available. Check back later!"}
              </p>
              <Button
                variant="primary"
                onClick={clearFilters}
                className="shadow-md hover:shadow-lg transition-all duration-300"
              >
                Clear Search & Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TripListPage;
