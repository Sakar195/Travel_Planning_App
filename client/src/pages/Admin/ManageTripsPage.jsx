import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllTrips } from "../../services/tripService";
import { adminDeleteTrip } from "../../services/adminService";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

function ManageTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    difficulty: "",
    sortBy: "title",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const fetchTrips = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching PUBLIC trips for admin...");
      const filterParams = { isPublic: true };
      const data = await getAllTrips(filterParams, page, ITEMS_PER_PAGE);
      setTrips(data.trips || data || []);
    } catch (err) {
      console.error("Error fetching public trips:", err);
      setError(
        "Failed to fetch public trips. " +
          (err.response?.data?.message || err.message)
      );
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage]);

  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips.filter((trip) => {
      if (!trip.isPublic) return false;

      const matchesSearch =
        !searchTerm ||
        trip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !filters.location ||
        trip.location?.name
          ?.toLowerCase()
          .includes(filters.location.toLowerCase());
      const matchesDifficulty =
        !filters.difficulty || trip.difficulty === filters.difficulty;

      return matchesSearch && matchesLocation && matchesDifficulty;
    });

    if (filters.sortBy === "title") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (filters.sortBy === "price_asc") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sortBy === "price_desc") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (filters.sortBy === "newest") {
      filtered.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return filtered;
  }, [trips, searchTerm, filters]);

  useEffect(() => {
    const total = Math.ceil(filteredAndSortedTrips.length / ITEMS_PER_PAGE);
    setTotalPages(total > 0 ? total : 1);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredAndSortedTrips, currentPage, totalPages]);

  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTrips.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTrips, currentPage]);

  const handleDelete = async (tripId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this trip? This action cannot be undone."
      )
    ) {
      try {
        console.log(`Deleting trip with ID: ${tripId}`);
        await adminDeleteTrip(tripId);
        showNotification("Trip deleted successfully");
        fetchTrips(currentPage);
      } catch (err) {
        console.error("Error deleting trip:", err);
        showNotification(
          err.response?.data?.message || "Failed to delete trip",
          "error"
        );
      }
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const locations = useMemo(
    () => [
      ...new Set(trips.map((trip) => trip.location?.name).filter(Boolean)),
    ],
    [trips]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search trips (title, location)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-gray-700 hover:bg-gray-50"
            aria-expanded={showFilters}
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <button
            onClick={fetchTrips}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
            aria-label="Refresh trips"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </button>
          <Link
            to="/admin/add-trip"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Trip</span>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm animate-fade-in-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="filter-location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <select
                id="filter-location"
                value={filters.location}
                onChange={(e) => {
                  setFilters({ ...filters, location: e.target.value });
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-difficulty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="filter-difficulty"
                value={filters.difficulty}
                onChange={(e) => {
                  setFilters({ ...filters, difficulty: e.target.value });
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-sortby"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort By
              </label>
              <select
                id="filter-sortby"
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters({ ...filters, sortBy: e.target.value });
                }}
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="title">Title (A-Z)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({ location: "", difficulty: "", sortBy: "title" });
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] text-sm"
            >
              Clear Filters & Search
            </button>
          </div>
        </div>
      )}

      {notification.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-fade-in-right
            ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
        >
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        )}
        {error && !loading && (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchTrips}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && paginatedTrips.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trip
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Difficulty
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTrips.map((trip) => (
                    <tr
                      key={trip._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden border border-[var(--color-border-light)]">
                            {trip.images && trip.images.length > 0 ? (
                              <img
                                src={(() => {
                                  const imagePath = trip.images[0];
                                  if (!imagePath)
                                    return "/placeholder-image.jpg";
                                  if (
                                    imagePath.startsWith("http://") ||
                                    imagePath.startsWith("https://")
                                  ) {
                                    return imagePath;
                                  }
                                  const baseUrl =
                                    import.meta.env.VITE_API_BASE_URL?.trim() ||
                                    "";
                                  if (baseUrl) {
                                    const cleanBasePath = baseUrl.endsWith("/")
                                      ? baseUrl.slice(0, -1)
                                      : baseUrl;
                                    const cleanImagePath = imagePath.startsWith(
                                      "/"
                                    )
                                      ? imagePath.slice(1)
                                      : imagePath;
                                    return `${cleanBasePath}/${cleanImagePath}`;
                                  }
                                  return "/placeholder-image.jpg";
                                })()}
                                alt={trip.title || "Trip image"}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  console.error(
                                    `Failed to load image. URL attempted: ${e.target.src}.`
                                  );
                                  e.target.src = "/placeholder-image.jpg";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {trip.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {trip.durationDays || trip.duration}
                              {(trip.durationDays || trip.duration) === 1
                                ? " day"
                                : " days"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {trip.location?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            trip.difficulty === "Easy"
                              ? "bg-green-100 text-green-800"
                              : trip.difficulty === "Moderate"
                              ? "bg-yellow-100 text-yellow-800"
                              : trip.difficulty === "Hard"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {trip.difficulty || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(trip.pricePerPerson !== undefined &&
                          trip.pricePerPerson !== null) ||
                        (trip.price !== undefined && trip.price !== null)
                          ? `Rs ${trip.pricePerPerson ?? trip.price}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            navigate(`/admin/edit-trip/${trip._id}`)
                          }
                          className="text-sky-600 hover:text-sky-800 mr-4 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 p-1 rounded"
                          aria-label={`Edit ${trip.title}`}
                          title={`Edit ${trip.title}`}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip._id)}
                          className="text-red-600 hover:text-red-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 p-1 rounded"
                          aria-label={`Delete ${trip.title}`}
                          title={`Delete ${trip.title}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 sm:px-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="sr-only">Previous</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {!loading &&
          !error &&
          paginatedTrips.length === 0 &&
          filteredAndSortedTrips.length === 0 &&
          trips.length > 0 && (
            <div className="text-center py-12 px-6">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No trips match your criteria
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setFilters({
                      location: "",
                      difficulty: "",
                      sortBy: "title",
                    });
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                >
                  Clear Filters & Search
                </button>
              </div>
            </div>
          )}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-12 px-6">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No trips created yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new trip.
            </p>
            <div className="mt-6">
              <Link
                to="/admin/add-trip"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Trip
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default ManageTripsPage;
