import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTripById } from "../services/tripService";
import { useTripStore } from "../store/tripStore";
import MediaDisplay from "../components/MediaDisplay";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import { isValidObjectId } from "../utils/validation";
import InteractiveMap from "../components/Common/InteractiveMap";

const formatDate = (dateString) => {
  if (!dateString) return "Not Set";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function MyRideDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const { getTripById: getTripFromStore, setSelectedTrip } = useTripStore();

  useEffect(() => {
    console.log("MyRideDetailPage mounted with ID:", id);
    if (!id) {
      setError("Missing ride ID");
      setLoading(false);
      return;
    }
    if (!isValidObjectId(id)) {
      console.warn("Ride ID format doesn't match expected pattern:", id);
    }
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting to fetch ride details for ID:", id);
      const cachedTrip = getTripFromStore(id);
      if (cachedTrip) {
        console.log(`[Cache Hit] Using cached ride data for ${id}`);
        setTrip(cachedTrip);
        setLoading(false);
        return;
      }
      console.log(`[API Fetch] Cache miss for ${id}. Fetching from API...`);
      const data = await getTripById(id);
      console.log(`[API Fetch] Received ride data from API for ${id}`);
      if (!data) {
        throw new Error("Ride data not found or empty response from API.");
      }

      setSelectedTrip(data);
      setTrip(data);
      console.log(`[Store Update] Updated store and state for ${id}`);
    } catch (err) {
      console.error(`[Error] Error fetching ride details for ${id}:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch ride details.";
      setError(errorMessage);
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

  const handleRetry = () => {
    fetchTripDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading ride details...</p>
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
              to="/my-rides"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Back to My Rides
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
            Ride Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested ride could not be loaded.
          </p>
          <Link
            to="/my-rides"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to My Rides
          </Link>
        </div>
      </div>
    );
  }

  let heroImageUrl = "/placeholder-image.jpg";
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
        to="/my-rides"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to My Rides
      </Link>

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
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {trip.durationDays
                  ? `${trip.durationDays} days`
                  : "Duration N/A"}
              </span>
              {trip.difficulty && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.difficulty === "Easy"
                      ? "bg-emerald-100 text-emerald-800"
                      : trip.difficulty === "Moderate"
                      ? "bg-amber-100 text-amber-800"
                      : trip.difficulty === "Difficult" ||
                        trip.difficulty === "Strenuous"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {trip.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

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
            Ride Details
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
          <button
            onClick={() => setActiveTab("map")}
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === "map"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Route Map
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

      <div className="w-full">
        {activeTab === "details" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              About This Ride
            </h2>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {trip.description}
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Ride Details
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
                  <p className="font-medium">{trip.location?.name || "N/A"}</p>
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
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
                  <p className="font-medium">{trip.difficulty || "Moderate"}</p>
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
                  <p className="font-medium">{trip.transportType || "Mixed"}</p>
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
              Ride Itinerary
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
                        {day.location?.name || day.location || "Location TBD"}
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
                No itinerary details added yet.
              </p>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Route Map</h2>
            {console.log(
              "[MyRideDetailPage] Rendering Map Tab. trip.route:",
              trip?.route
            )}
            <div
              className="border border-gray-200 rounded-lg overflow-hidden"
              style={{ height: "500px" }}
            >
              {trip.route && trip.route.length > 0 ? (
                <InteractiveMap
                  markers={trip.route}
                  isEditable={false}
                  height={500}
                  key="view-map"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No route points were saved for this ride.
                </div>
              )}
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
    </div>
  );
}

export default MyRideDetailPage;
