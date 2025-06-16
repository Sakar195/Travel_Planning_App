import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const status = searchParams.get("status");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
      <CheckCircleIcon className="w-20 h-20 text-green-500 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        Booking Confirmed!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Your trip booking has been successfully confirmed. Thank you!
      </p>

      {bookingId && (
        <div className="bg-gray-100 p-4 rounded-lg mb-8 inline-block border border-gray-200">
          <p className="text-sm text-gray-500">Your Booking Reference ID:</p>
          <p className="text-lg font-medium text-gray-800 font-mono break-all">
            {bookingId}
          </p>
        </div>
      )}

      {status && (
        <p className="text-sm text-gray-500 mb-8">(Status: {status})</p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/dashboard" // Link to user's booking dashboard
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
        >
          View My Bookings
        </Link>
        <Link
          to="/trips" // Link back to browse more trips
          className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-300"
        >
          Browse More Trips
        </Link>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
