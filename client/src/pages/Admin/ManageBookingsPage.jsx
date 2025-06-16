import React, { useState, useEffect, Fragment } from "react";
import {
  adminGetAllBookings,
  adminCancelBooking,
} from "../../services/adminService";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  EyeIcon,
  XCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TicketIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";

function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
  });
  const [notification, setNotification] = useState({ message: "", type: "" });

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // -------------------

  // NOTE: Pagination logic needs refinement based on API capabilities
  // Current implementation assumes all bookings are fetched and filtered client-side
  const ITEMS_PER_PAGE = 10;

  // --- Data Fetching ---
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching all bookings for admin...");
      // Assuming adminGetAllBookings fetches ALL bookings needed for client-side filtering/pagination
      const data = await adminGetAllBookings();
      setBookings(data || []); // Ensure it's an array
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(
        "Failed to fetch bookings. " +
          (err.response?.data?.message || err.message)
      );
      setBookings([]); // Clear bookings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []); // Fetch on initial load

  // --- Filtering Logic (Client-side) ---
  const filteredBookings = bookings.filter((booking) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      booking.userId?.username?.toLowerCase().includes(lowerSearchTerm) ||
      booking.tripId?.title?.toLowerCase().includes(lowerSearchTerm) ||
      booking.status?.toLowerCase().includes(lowerSearchTerm) ||
      booking._id?.toLowerCase().includes(lowerSearchTerm);

    const matchesStatus =
      !filters.status ||
      booking.status?.toLowerCase() === filters.status.toLowerCase();

    // TODO: Implement proper date range filtering based on bookingDate or rideId.startDate
    const matchesDateRange = true;

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // --- Pagination Logic (Client-side) ---
  useEffect(() => {
    const total = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    setTotalPages(total > 0 ? total : 1);
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredBookings, currentPage]);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
  // --------------------------------------

  // --- Notification System ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };
  // --------------------------

  // --- Modal Functions ---
  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };
  // ----------------------

  // --- Handle Cancel Booking (Backend) ---
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        setLoading(true); // Indicate processing
        console.log(`Admin cancelling booking ${bookingId}`);
        await adminCancelBooking(bookingId); // Call the backend service
        showNotification("Booking cancelled successfully");
        fetchBookings(); // Refetch the list to show updated status
      } catch (err) {
        console.error("Error cancelling booking:", err);
        showNotification(
          err.response?.data?.message || "Failed to cancel booking",
          "error"
        );
        setLoading(false); // Ensure loading is turned off on error
      }
      // setLoading(false) will be handled in fetchBookings' finally block if successful
    }
  };
  // --------------------------------------

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title and description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Manage Bookings
        </h1>
        <p className="text-gray-500">
          View and manage all trip bookings in the system.
        </p>
      </div>

      {/* Action header with search and filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user, trip, status, ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter section - conditionally rendered */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm animate-fade-in-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {/* TODO: Replace Date Range dropdown with actual date pickers */}
            {/*
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  { setFilters({ ...filters, dateRange: e.target.value }); setCurrentPage(1); }
                }
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            */}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({ status: "", dateRange: "" });
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="text-sm text-sky-500 hover:text-sky-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Notification toast */}
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

      {/* Main content with conditional rendering */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-200">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Booking ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
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
                    Trip Start Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
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
                {paginatedBookings.map((booking, index) => (
                  <tr
                    key={booking._id || index}
                    className="hover:bg-gray-50 animate-fade-in transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking._id || `BK-${index + 1000}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            {booking.userId?.username?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.userId?.username || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.tripId?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.tripId?.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          booking.status?.toLowerCase() === "confirmed"
                            ? "bg-white text-green-800 border border-green-300"
                            : booking.status?.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(booking)}
                        className="text-sky-600 hover:text-sky-900 mr-3 inline-flex items-center"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </button>
                      {booking.status?.toLowerCase() !== "cancelled" &&
                        booking.status?.toLowerCase() !== "failed" && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                            title="Cancel Booking"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-[var(--color-border)]">
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
            No bookings found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filters.status || filters.dateRange
              ? "Try adjusting your search or filters"
              : "No bookings have been made yet"}
          </p>
        </div>
      )}

      {/* Pagination controls */}
      {filteredBookings.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, filteredBookings.length)} of{" "}
            {filteredBookings.length} bookings
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-0 text-left align-middle shadow-xl transition-all">
                  {selectedBooking ? (
                    <>
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4 text-white relative">
                        <div className="flex justify-between items-start">
                          <Dialog.Title
                            as="h3"
                            className="text-xl font-semibold leading-6"
                          >
                            Booking Details
                          </Dialog.Title>

                          <button
                            type="button"
                            className="text-white/80 hover:text-white transition-colors"
                            onClick={closeModal}
                            aria-label="Close modal"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>

                        <div className="mt-1 flex items-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              selectedBooking.status?.toLowerCase() ===
                              "confirmed"
                                ? "bg-white text-green-800 border border-green-300"
                                : selectedBooking.status?.toLowerCase() ===
                                  "pending"
                                ? "bg-yellow-300 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedBooking.status?.toLowerCase() ===
                            "confirmed" ? (
                              <CheckBadgeIcon className="h-3.5 w-3.5" />
                            ) : selectedBooking.status?.toLowerCase() ===
                              "pending" ? (
                              <ClockIcon className="h-3.5 w-3.5" />
                            ) : (
                              <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                            )}
                            {selectedBooking.status || "Pending"}
                          </span>

                          <div className="ml-4 text-sm text-white/90 flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {formatDate(selectedBooking.bookingDate)}
                          </div>
                        </div>
                      </div>

                      {/* Content area with improved design */}
                      <div className="p-6 space-y-6">
                        {/* Booking ID with lighter background */}
                        <div className="bg-sky-50 rounded-lg border border-sky-100 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              Booking Reference
                            </span>
                            <span className="font-mono bg-white px-2 py-1 rounded border border-sky-200 text-gray-700">
                              {selectedBooking._id}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                          {/* User Info - 2 columns */}
                          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-sky-50 to-sky-100 px-4 py-2.5">
                              <h4 className="font-medium text-gray-800 flex items-center">
                                <UserCircleIcon className="w-5 h-5 mr-2 text-sky-500" />
                                User Information
                              </h4>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-sky-100 text-sky-700 flex items-center justify-center rounded-full">
                                  {selectedBooking.userId?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {selectedBooking.userId?.username || "N/A"}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2 space-y-2">
                                <div className="flex items-center text-sm">
                                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    {selectedBooking.userId?.email || "N/A"}
                                  </span>
                                </div>
                                {selectedBooking.userId?.phone && (
                                  <div className="flex items-center text-sm">
                                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                      {selectedBooking.userId.phone}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Trip Info - 3 columns */}
                          <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-sky-50 to-sky-100 px-4 py-2.5">
                              <h4 className="font-medium text-gray-800 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2 text-sky-500" />
                                Trip Details
                              </h4>
                            </div>
                            <div className="p-4 space-y-3">
                              <h5 className="font-medium text-gray-900">
                                {selectedBooking.tripId?.title || "N/A"}
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <div className="flex items-start text-sm">
                                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                  <div>
                                    <span className="block text-gray-500">
                                      Location
                                    </span>
                                    <span className="text-gray-800">
                                      {selectedBooking.tripId?.location?.name ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-start text-sm">
                                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                  <div>
                                    <span className="block text-gray-500">
                                      Start Date
                                    </span>
                                    <span className="text-gray-800">
                                      {formatDate(
                                        selectedBooking.tripId?.startDate
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {selectedBooking.tripId?.endDate && (
                                  <div className="flex items-start text-sm">
                                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                      <span className="block text-gray-500">
                                        End Date
                                      </span>
                                      <span className="text-gray-800">
                                        {formatDate(
                                          selectedBooking.tripId?.endDate
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {selectedBooking.tripId?.price && (
                                  <div className="flex items-start text-sm">
                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                      <span className="block text-gray-500">
                                        Price
                                      </span>
                                      <span className="text-gray-800">
                                        ${selectedBooking.tripId.price}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
                          <div className="bg-gradient-to-r from-sky-50 to-sky-100 px-4 py-2.5">
                            <h4 className="font-medium text-gray-800 flex items-center">
                              <TicketIcon className="w-5 h-5 mr-2 text-sky-500" />
                              Service Information
                            </h4>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start text-sm">
                                <div className="w-5 text-gray-400 mr-2 flex justify-center">
                                  <TicketIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <span className="block text-gray-500">
                                    Service Type
                                  </span>
                                  <span className="text-gray-800 font-medium">
                                    {selectedBooking.serviceType || "Standard"}
                                  </span>
                                </div>
                              </div>

                              {selectedBooking.participants && (
                                <div className="flex items-start text-sm">
                                  <div className="w-5 text-gray-400 mr-2 flex justify-center">
                                    <UserCircleIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <span className="block text-gray-500">
                                      Participants
                                    </span>
                                    <span className="text-gray-800 font-medium">
                                      {selectedBooking.participants}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Service Details box (if available) */}
                            {selectedBooking.serviceDetails &&
                              Object.keys(selectedBooking.serviceDetails)
                                .length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                                    Additional Details
                                  </h5>
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                                      {JSON.stringify(
                                        selectedBooking.serviceDetails,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Footer with action buttons */}
                      <div className="border-t border-gray-200 px-6 py-4 bg-sky-50 flex justify-between items-center">
                        {selectedBooking.status?.toLowerCase() !==
                          "cancelled" &&
                          selectedBooking.status?.toLowerCase() !==
                            "failed" && (
                            <button
                              onClick={() => {
                                closeModal();
                                handleCancelBooking(selectedBooking._id);
                              }}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1.5" />
                              Cancel Booking
                            </button>
                          )}
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors ml-auto"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6">
                      <p className="text-gray-500">
                        No booking selected or details are missing.
                      </p>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 transition-colors"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* CSS Animations */}
      <style jsx>{`
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

export default ManageBookingsPage;
