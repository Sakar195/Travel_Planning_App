// src/pages/TripDetailPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getTripById } from "../services/tripService";
import { initiateBooking } from "../services/bookingService";
import { useAuth } from "../hooks/useAuth";
import { useTripStore } from "../store/tripStore";
import MediaDisplay from "../components/MediaDisplay";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
// import { initiateBooking } from "../services/bookingService";
import { isValidObjectId } from "../utils/validation";
import InteractiveMap from "../components/Common/InteractiveMap";

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "Flexible";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to redirect to eSewa - Updated for actual backend response
const redirectToEsewa = (paymentUrl, formData) => {
  const form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action", paymentUrl); // Use paymentUrl for action

  // Use fields directly from the formData object
  for (const key in formData) {
    if (Object.prototype.hasOwnProperty.call(formData, key)) {
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", formData[key]);
      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form); // Clean up the form
};

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [bookingForm, setBookingForm] = useState({
    serviceType: "Full Package",
    serviceDetails: {
      participants: 1,
      roomType: "Standard",
      transportType: "Any",
    },
  });

  // Get trip store functions (primarily for caching)
  const { getTripById: getTripFromStore, setSelectedTrip } = useTripStore();

  // Determine if this is a personal trip
  const isPersonalRide =
    trip &&
    // Either it's explicitly marked as not bookable
    (trip.isBookable === false ||
      // Or the creator is the current user (for backwards compatibility with older data)
      (user &&
        trip.creatorId &&
        (String(trip.creatorId) === String(user.id) ||
          String(trip.creatorId) === String(user._id))));

  useEffect(() => {
    console.log("TripDetailPage mounted with ID:", id);
    if (!id) {
      setError("Missing trip ID");
      setLoading(false);
      return;
    }

    // Log validation check but don't prevent fetch attempt
    if (!isValidObjectId(id)) {
      console.warn("Trip ID format doesn't match expected pattern:", id);
      // We'll still try to fetch as the backend might support this format
    }

    // Fetch details regardless of ID format validation
    fetchTripDetails();
  }, [id]);

  useEffect(() => {
    if (trip && user) {
      // Debug log to help troubleshoot personal ride detection
      console.log("Trip creator check:", {
        tripId: trip._id,
        creatorId: trip.creatorId,
        userId: user.id || user._id,
        isCreator:
          String(trip.creatorId) === String(user.id) ||
          String(trip.creatorId) === String(user._id),
        isBookable: trip.isBookable,
        isPersonalRide,
      });
    }
  }, [trip, user, isPersonalRide]);

  const fetchTripDetails = async () => {
    if (!id) return; // Only check for missing ID, not format

    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to fetch trip details for ID:", id);

      // Try to get from store cache first
      const cachedTrip = getTripFromStore(id);
      console.log(
        `[Cache Check] Attempting to get trip ${id} from cache. Found:`,
        cachedTrip
      );
      if (cachedTrip) {
        console.log(
          `[Cache Hit] Using cached trip data for ${id}:`,
          cachedTrip
        );
        setTrip(cachedTrip);
        setLoading(false);
        return;
      }

      // If not in cache, fetch from API
      console.log(`[API Fetch] Cache miss for ${id}. Fetching from API...`);
      const data = await getTripById(id);
      console.log(`[API Fetch] Received trip data from API for ${id}:`, data);

      if (!data) {
        throw new Error("Trip data not found or empty response from API.");
      }

      // Save to store (for cache) and state
      setSelectedTrip(data);
      setTrip(data);
      console.log(
        `[Store Update] Updated store and state for ${id} with:`,
        data
      );
    } catch (err) {
      console.error(`[Error] Error fetching trip details for ${id}:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch trip details.";
      setError(errorMessage);
      // Log more details if available
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      }
    } finally {
      setLoading(false);
    }
  };

  // Keep retry button, remove mock data button
  const handleRetry = () => {
    fetchTripDetails();
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/trips/${id}` } });
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");

      const bookingData = {
        serviceType: bookingForm.serviceType,
        tripId: id,
        numberOfPersons: bookingForm.serviceDetails.participants,
        serviceDetails: {
          roomType: bookingForm.serviceDetails.roomType,
          transportType: bookingForm.serviceDetails.transportType,
        },
        paymentMethod: "esewa",
      };

      console.log("Submitting booking data for initiation:", bookingData);

      // Call the backend to initiate booking and get eSewa params
      const response = await initiateBooking(bookingData);

      console.log("Booking initiation response:", response);

      // Check if response contains the expected paymentUrl and formData
      if (response && response.paymentUrl && response.formData) {
        // Redirect to eSewa using the new structure
        redirectToEsewa(response.paymentUrl, response.formData);
        // Keep loading state as redirection will happen
      } else {
        // Handle case where backend didn't return expected eSewa data
        console.error(
          "Backend did not return valid eSewa parameters (paymentUrl/formData):",
          response
        );
        setBookingError(
          "Failed to initiate payment redirect. Invalid response from server."
        );
        setBookingLoading(false); // Stop loading as we can't proceed
      }
    } catch (err) {
      let errorMessage = "Failed to create booking. Please try again.";
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        errorMessage = err.response.data.errors.map((e) => e.msg).join(" ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setBookingError(errorMessage);
      console.error("Booking error:", err.response?.data || err);
      setBookingLoading(false); // Stop loading on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      // Special handling for participants to ensure it's a number
      const processedValue =
        child === "participants" ? parseInt(value, 10) || 1 : value;

      setBookingForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue,
        },
      }));
    } else {
      setBookingForm((prev) => ({
        ...prev,
        [name]: value, // Assume top-level fields are strings/selects
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <ErrorMessage message={error} />
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Retry Fetch
            </button>
            <Link
              to={isPersonalRide ? "/my-rides" : "/trips"}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
            >
              {isPersonalRide ? "Back to My Rides" : "Browse All Trips"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Trip Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested trip could not be loaded.
          </p>
          <Link
            to={isPersonalRide ? "/my-rides" : "/trips"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {isPersonalRide ? "Back to My Rides" : "Browse All Trips"}
          </Link>
        </div>
      </div>
    );
  }

  let heroImageUrl = "/placeholder-image.jpg"; // Default placeholder
  if (trip.images && trip.images.length > 0) {
    heroImageUrl = trip.images[0].startsWith("/")
      ? `http://localhost:5001${trip.images[0]}`
      : trip.images[0];
  } else if (trip.image) {
    heroImageUrl = trip.image.startsWith("/")
      ? `http://localhost:5001${trip.image}`
      : trip.image;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={isPersonalRide ? "/my-rides" : "/trips"}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; {isPersonalRide ? "Back to My Rides" : "Back to Trips"}
      </Link>

      {/* Hero Section - keep price badge only for bookable trips*/}
      <div className="relative h-80 rounded-xl overflow-hidden mb-8 bg-gray-200">
        <img
          src={heroImageUrl}
          alt={trip.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            if (e.target.src !== "/placeholder-image.jpg") {
              console.warn(
                `Failed to load hero image: ${heroImageUrl}, falling back to placeholder.`
              );
              e.target.onerror = null;
              e.target.src = "/placeholder-image.jpg";
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {trip.title}
            </h1>
            <p className="text-gray-200 text-lg mb-4">
              {trip.location?.name || "Location not specified"}
            </p>
            <div className="flex items-center gap-4">
              {!isPersonalRide && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {trip.pricePerPerson
                    ? `${trip.currency || "Rs"} ${trip.pricePerPerson}`
                    : trip.price
                    ? `${trip.currency || "Rs"} ${trip.price}`
                    : "Contact for pricing"}
                </span>
              )}
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {trip.durationDays
                  ? `${trip.durationDays} days`
                  : "Duration N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab("details")}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === "details"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Trip Details
          </button>

          <button
            onClick={() => setActiveTab("itinerary")}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === "itinerary"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Itinerary
          </button>

          {/* New Maps Tab */}
          <button
            onClick={() => setActiveTab("maps")}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === "maps"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Maps
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === "media"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Photos & Videos
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - expand to full width for personal trips */}
        <div className={isPersonalRide ? "w-full" : "md:w-2/3"}>
          {activeTab === "details" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                About This Trip
              </h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">
                {trip.description}
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Trip Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(trip.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {trip.durationDays ? `${trip.durationDays} days` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {trip.location?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium">
                      {trip.distance ? `${trip.distance} km` : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Difficulty</p>
                    <p className="font-medium">
                      {trip.difficulty || "Moderate"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transportation</p>
                    <p className="font-medium">
                      {trip.transportType || "Mixed"}
                    </p>
                  </div>
                </div>
              </div>

              {trip.tags && trip.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "itinerary" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Trip Itinerary
              </h2>

              {trip.itinerary && trip.itinerary.length > 0 ? (
                <div className="space-y-8">
                  {trip.itinerary.map((day, index) => (
                    <div key={index} className="relative pl-8 pb-2">
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200"></div>
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center -translate-x-1/2">
                        <span className="text-white text-xs font-bold">
                          {day.day}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Day {day.day}:{" "}
                          {day.location?.name || "Unknown Location"}
                        </h3>

                        {day.activities && day.activities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-700 mb-2">
                              Activities:
                            </h4>
                            <ul className="list-disc list-inside pl-2 text-gray-600 space-y-1">
                              {day.activities.map((activity, actIdx) => (
                                <li key={actIdx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {day.lodging && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-700 mb-1">
                              Lodging:
                            </h4>
                            <p className="text-gray-600">{day.lodging}</p>
                          </div>
                        )}

                        {day.notes && (
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-1">
                              Notes:
                            </h4>
                            <p className="text-gray-600 italic">{day.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">
                  Detailed itinerary will be provided upon booking.
                </p>
              )}
            </div>
          )}

          {activeTab === "maps" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Trip Route Preview
                  </h3>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      This map previews the likely route based on the starting
                      point and daily locations. The actual route taken may
                      vary.
                    </p>
                    <div
                      className="border border-gray-200 rounded-lg overflow-hidden"
                      style={{ height: "500px" }}
                    >
                      <InteractiveMap
                        startLocation={trip.meetUpPoint}
                        itineraryLocations={trip.itinerary}
                        profile={
                          trip.transportType === "Bicycle"
                            ? "cycling-regular"
                            : "driving-car"
                        } // Pass transport profile
                        height={500}
                        key={`detail-map-${trip._id}`} // Add key to help with potential re-renders
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Photos & Videos
              </h2>
              <MediaDisplay rideId={id} tripImages={trip.images || []} />
            </div>
          )}
        </div>

        {/* Right Column - Booking Widget (only show for non-personal trips) */}
        {!isPersonalRide && (
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Book This Trip
              </h2>
              <div className="mb-4">
                <p className="text-gray-700 font-medium">Price:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trip.pricePerPerson
                    ? `${trip.currency || "Rs"} ${trip.pricePerPerson}`
                    : trip.price
                    ? `${trip.currency || "Rs"} ${trip.price}`
                    : "Contact for pricing"}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  Free cancellation up to 7 days before the trip
                </span>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal - only show for non-personal trips */}
      {showBookingModal && !isPersonalRide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-medium">Book Your Trip</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-white hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleBookingSubmit}>
                {bookingError && (
                  <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{bookingError}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Service Type
                  </label>
                  <select
                    name="serviceType"
                    value={bookingForm.serviceType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Accommodation">Accommodation</option>
                    <option value="Activity">Activity</option>
                    <option value="Full Package">Full Package</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    name="serviceDetails.participants"
                    value={bookingForm.serviceDetails.participants}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {bookingForm.serviceType === "Accommodation" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Room Type
                    </label>
                    <select
                      name="serviceDetails.roomType"
                      value={bookingForm.serviceDetails.roomType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                      <option value="Dormitory">Dormitory</option>
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Transport Type (Optional)
                  </label>
                  <select
                    name="serviceDetails.transportType"
                    value={bookingForm.serviceDetails.transportType || "Any"}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Any">Any Available</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Own">Using Own Transport</option>
                  </select>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ${
                      bookingLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {bookingLoading ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripDetailPage;
