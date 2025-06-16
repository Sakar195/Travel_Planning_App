import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import api from "../services/api"; // Assuming you have your API setup

const ReservationPage = () => {
  const { tripId } = useParams(); // Optional tripId if coming from a specific trip
  const [formData, setFormData] = useState({
    userId: "", // Will likely get this from useAuth context
    rideId: tripId || "", // Pre-fill if tripId is in URL
    serviceType: "Full Package", // Default or based on selection
    serviceDetails: {
      participants: 1,
      specialRequests: "",
      // Add other relevant fields like roomType, checkInDate etc. based on serviceType
    },
  });
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tripId) {
      const fetchTrip = async () => {
        // Similar fetch logic as in TripDetailPage
        try {
          const response = await api.get(`/trips/${tripId}`);
          setTripDetails(response.data);
        } catch (err) {
          console.error("Failed to fetch trip details for reservation:", err);
        }
      };
      fetchTrip();
    }
  }, [tripId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested serviceDetails
    if (name.startsWith("serviceDetails.")) {
      const detailKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        serviceDetails: {
          ...prev.serviceDetails,
          [detailKey]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic Validation (requirement.dmd Section 4)
    if (!formData.rideId) {
      setError("Trip selection is required.");
      setLoading(false);
      return;
    }
    // Add more validation...

    try {
      console.log("Submitting reservation:", formData);

      alert("Reservation submitted successfully! (Placeholder)");
    } catch (err) {
      const message =
        err.response?.data?.message || "Reservation failed. Please try again.";
      setError(message);
      console.error("Reservation error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Book Your Trip</h1>

      {tripDetails && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-semibold">
            Booking for: {tripDetails.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Location: {tripDetails.location}
          </p>
          {/* Display other relevant trip details */} T
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        {/* If tripId not from URL, add a Trip Selection dropdown here */}
        {!tripId && (
          <div className="mb-4">
            <label
              htmlFor="rideId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Trip
            </label>
            {/* TODO: Fetch trips and populate a <select> element */}
            <select
              id="rideId"
              name="rideId"
              value={formData.rideId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white sm:text-sm border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="" disabled>
                -- Select a Trip --
              </option>
            </select>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Service Type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white sm:text-sm border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Full Package">Full Package</option>
            <option value="Accommodation">Accommodation Only</option>
            <option value="Activity">Activity Only</option>
            {/* Add more options as needed */}
          </select>
        </div>

        <Input
          id="serviceDetails.participants"
          name="serviceDetails.participants"
          label="Number of Participants"
          type="number"
          min="1"
          value={formData.serviceDetails.participants}
          onChange={handleChange}
          required
        />

        <div className="mb-4">
          <label
            htmlFor="serviceDetails.specialRequests"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Special Requests (Optional)
          </label>
          <textarea
            id="serviceDetails.specialRequests"
            name="serviceDetails.specialRequests"
            rows="3"
            value={formData.serviceDetails.specialRequests}
            onChange={handleChange}
            placeholder="e.g., Dietary restrictions, preferred room type..."
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white sm:text-sm border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full mt-2"
        >
          {loading ? "Submitting Reservation..." : "Confirm Reservation"}
        </Button>
      </form>
    </div>
  );
};

export default ReservationPage;
