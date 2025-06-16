// server/controllers/bookingController.js
const bookingService = require("../services/bookingService");
// const tripService = require("../services/tripService"); // No longer needed here, service handles trip checks
const asyncHandler = require("express-async-handler"); // Use asyncHandler for cleaner error handling
const { URLSearchParams } = require("url"); // Import URLSearchParams

/**
 * @desc    Initiate a new booking and payment
 * @route   POST /api/bookings/initiate
 * @access  Private
 */
const initiateBookingController = asyncHandler(async (req, res) => {
  const { tripId, numberOfPersons, paymentMethod } = req.body;
  const userId = req.user.id; // Assuming auth middleware adds user to req

  if (!tripId || !numberOfPersons || !paymentMethod) {
    res.status(400);
    throw new Error(
      "Missing required fields: tripId, numberOfPersons, paymentMethod"
    );
  }

  const paymentData = await bookingService.initiateBooking(
    userId,
    tripId,
    Number(numberOfPersons), // Ensure it's a number
    paymentMethod.toLowerCase() // Ensure lowercase
  );

  // paymentData contains { formData, esewaUrl, paymentId } for eSewa
  // Or similar structure for other gateways
  res.status(200).json(paymentData);
});

/**
 * @desc    Handle callback from payment gateway
 * @route   GET /api/bookings/callback/:gateway
 * @access  Public
 */
const handleGatewayCallbackController = asyncHandler(async (req, res) => {
  const gateway = req.params.gateway.toLowerCase();
  let queryParams = req.query;
  let dataParam = queryParams.data; // Attempt standard parsing first

  console.log(`Raw Callback URL: ${req.originalUrl}`);
  console.log(`Initial req.query:`, queryParams);

  // --- Handling potentially malformed URL from eSewa ---
  // If standard req.query doesn't contain 'data', but the URL has it after a second '?'
  if (!dataParam && req.originalUrl.includes("?data=")) {
    try {
      console.warn(
        "Potential double ' ? ' in URL. Attempting manual parse for 'data'."
      );
      const queryString = req.originalUrl.split("?").slice(1).join("?"); // Get everything after the first ?
      const parsedParams = new URLSearchParams(queryString.replace("?", "&")); // Replace second ? with &
      dataParam = parsedParams.get("data");
      if (dataParam) {
        console.log("Manually extracted 'data' parameter:", dataParam);
        // Merge manually parsed params with original if necessary, or just use dataParam
        // For simplicity, we only really needed the 'data' param here
      } else {
        console.warn("Manual parse attempt did not find 'data' param.");
      }
    } catch (parseError) {
      console.error("Error manually parsing URL:", parseError);
      // Proceed without dataParam if manual parse fails
    }
  }
  // --------------------------------------------------------

  let paymentData = {};
  let transactionId = queryParams.oid; // Use standard parsing for oid
  let refId = queryParams.refId; // Use standard parsing for refId
  let callbackStatus = queryParams.status; // Use standard parsing for status

  // Extract relevant data based on gateway
  if (gateway === "esewa") {
    // Additional check for encoded data in the dataParam (extracted above)
    if (dataParam) {
      try {
        const base64Data = dataParam; // Use the potentially manually extracted dataParam
        const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
        const esewaData = JSON.parse(decodedData);
        console.log("Decoded eSewa data from callback:", esewaData);

        // Prioritize values from decoded data if they exist
        transactionId = esewaData.transaction_uuid || transactionId;
        refId = esewaData.transaction_code || refId;
        // Note: We rely on our 'status' param in the URL, not esewaData.status directly here
      } catch (decodeError) {
        console.error("Failed to decode eSewa data parameter:", decodeError);
        // Proceed without decoded data, rely on oid/refId if present from standard parse
      }
    }

    paymentData = {
      transactionId: transactionId,
      refId: refId,
      callbackStatus: callbackStatus,
      rawData: queryParams, // Keep original query for logging/debug
    };
  } else if (gateway === "khalti") {
    // TODO: Extract Khalti parameters (e.g., pidx, transaction_id, status)
    res.status(501).send("Khalti callback handling not implemented.");
    return;
  } else {
    res.status(400).send(`Unsupported gateway: ${gateway}`);
    return;
  }

  if (!paymentData.transactionId) {
    console.error("Could not extract transactionId from callback.");
    res.redirect(
      `${process.env.CLIENT_URL}/booking-failure?reason=invalid_callback`
    );
    return;
  }

  const verificationResult = await bookingService.verifyPayment(
    gateway,
    paymentData
  );

  // Redirect user to frontend based on verification result
  if (verificationResult.success) {
    console.log(
      `Redirecting successful booking ${verificationResult.booking?._id} to success page.`
    );
    res.redirect(
      `${process.env.CLIENT_URL}/booking-success?bookingId=${verificationResult.booking?._id}&status=confirmed`
    );
  } else {
    console.log(
      `Redirecting failed/pending booking to failure page. Reason: ${verificationResult.message}`
    );
    // Include bookingId if available, even for failures
    const bookingIdParam = verificationResult.booking?._id
      ? `&bookingId=${verificationResult.booking._id}`
      : "";
    res.redirect(
      `${process.env.CLIENT_URL}/booking-failure?reason=${encodeURIComponent(
        verificationResult.message || "payment_failed"
      )}${bookingIdParam}&status=failed`
    );
  }
});

/**
 * Get all bookings for the authenticated user
 * @route GET /api/bookings/my-bookings
 * @access Private
 */
const getUserBookingsController = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user.id);
  res.status(200).json(bookings);
});

/**
 * Get a specific booking by ID
 * @route GET /api/bookings/:id
 * @access Private
 */
const getBookingByIdController = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const booking = await bookingService.getBookingById(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if the user is authorized (owner or potentially admin in future)
  if (booking.userId._id.toString() !== req.user.id) {
    // Add admin check here if needed: && req.user.role !== 'admin'
    res.status(403);
    throw new Error("Not authorized to view this booking");
  }

  res.status(200).json(booking);
});

/**
 * Cancel a booking
 * @route PUT /api/bookings/:id/cancel
 * @access Private
 */
const cancelBookingController = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id; // Pass userId for service layer check

  const cancelledBooking = await bookingService.cancelBooking(
    bookingId,
    userId
  );

  if (!cancelledBooking) {
    // This means booking not found OR user not authorized by service layer
    res.status(404); // Or 403 depending on desired feedback
    throw new Error(
      "Booking not found or user not authorized to cancel this booking."
    );
  }

  res.status(200).json(cancelledBooking);
});

/**
 * ADMIN: Get all bookings (populated)
 * @route GET /api/bookings/admin/all
 * @access Private/Admin
 */
const adminGetAllBookingsController = asyncHandler(async (req, res) => {
  // Ensure admin check middleware has run before this controller
  const bookings = await bookingService.getAllBookingsPopulated();

  // --- DEBUG LOG ---
  console.log("--- Data sent from adminGetAllBookingsController ---");
  console.log(JSON.stringify(bookings, null, 2)); // Log the exact data being sent
  console.log("--- End of data log ---");
  // --- END DEBUG LOG ---

  res.status(200).json(bookings);
});

/**
 * ADMIN: Cancel a booking by ID
 * @route PUT /api/bookings/admin/cancel/:id
 * @access Private/Admin
 */
const adminCancelBookingController = asyncHandler(async (req, res) => {
  // Ensure admin check middleware has run before this controller
  const bookingId = req.params.id;
  const cancelledBooking = await bookingService.adminCancelBookingById(
    bookingId
  );
  res.status(200).json(cancelledBooking); // Service layer throws error if not found
});

module.exports = {
  initiateBookingController,
  handleGatewayCallbackController,
  getUserBookingsController,
  getBookingByIdController,
  cancelBookingController,
  adminGetAllBookingsController,
  adminCancelBookingController,
};
