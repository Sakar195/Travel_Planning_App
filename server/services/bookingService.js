const Booking = require("../models/Booking");
const Trip = require("../models/Trip"); // Import Trip model
const crypto = require("crypto"); // Import crypto for signatures
const axios = require("axios"); // Import axios for HTTP requests
const mongoose = require("mongoose"); // Import mongoose for transactions
const { v4: uuidv4 } = require("uuid"); // For generating unique transaction IDs

/**
 * Verify trip existence and seat availability
 * @param {String} tripId - ID of the trip
 * @param {Number} numberOfPersons - Number of persons to book
 * @returns {Promise<Object>} The trip object if available
 * @throws {Error} If trip not found or not enough seats
 */
const verifyAvailability = async (tripId, numberOfPersons) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }
  if (trip.availableSeats < numberOfPersons) {
    throw new Error(
      `Not enough available seats. Only ${trip.availableSeats} left.`
    );
  }
  return trip;
};

/**
 * Initiates the booking process and prepares payment gateway data.
 * @param {String} userId - ID of the user making the booking.
 * @param {String} tripId - ID of the trip being booked.
 * @param {Number} numberOfPersons - Number of people for the booking.
 * @param {String} paymentMethod - Chosen payment method ('esewa' or 'khalti').
 * @returns {Promise<Object>} Payment gateway specific data (e.g., formData and esewaUrl for eSewa).
 * @throws {Error} If validation fails, trip unavailable, or gateway interaction fails.
 */
const initiateBooking = async (
  userId,
  tripId,
  numberOfPersons,
  paymentMethod
) => {
  if (!userId || !tripId || !numberOfPersons || !paymentMethod) {
    throw new Error("Missing required booking information.");
  }
  if (numberOfPersons < 1) {
    throw new Error("Number of persons must be at least 1.");
  }

  const trip = await verifyAvailability(tripId, numberOfPersons); // Verify availability first

  const totalAmount = trip.pricePerPerson * numberOfPersons;
  const transactionId = `GOLI-${Date.now()}-${uuidv4().substring(0, 8)}`; // Generate unique ID

  // Create initial booking record
  let booking = new Booking({
    userId,
    tripId,
    numberOfPersons,
    totalAmount,
    transactionId,
    paymentMethod,
    status: "pending", // Overall booking status
    paymentStatus: "pending", // Specific payment status
  });
  await booking.save();

  try {
    let paymentData;
    if (paymentMethod === "esewa") {
      paymentData = await initiateEsewaPayment(
        booking.totalAmount,
        booking.transactionId,
        booking._id.toString()
      );
    } else if (paymentMethod === "khalti") {
      // TODO: Implement Khalti initiation
      throw new Error("Khalti payment method not yet implemented.");
    } else {
      throw new Error("Invalid payment method specified.");
    }

    // Update booking status to initiated after getting gateway data
    booking.paymentStatus = "initiated";
    await booking.save();

    return paymentData;
  } catch (error) {
    // If gateway initiation fails, mark booking as failed
    booking.status = "failed";
    booking.paymentStatus = "failed";
    await booking.save();
    console.error(
      `Payment initiation failed for booking ${booking._id}:`,
      error
    );
    throw new Error(
      `Failed to initiate payment with ${paymentMethod}: ${error.message}`
    );
  }
};

/**
 * Prepare data for eSewa payment form redirection.
 * @param {Number} totalAmount - The total amount for the transaction.
 * @param {String} transactionId - Our unique transaction ID.
 * @param {String} bookingId - The MongoDB ObjectId of the booking.
 * @returns {Promise<Object>} Object containing formData and esewaUrl.
 */
const initiateEsewaPayment = async (totalAmount, transactionId, bookingId) => {
  const merchantCode = process.env.ESEWA_MERCHANT_CODE;
  const secretKey = process.env.ESEWA_V2_SECRET_KEY;
  const esewaEpayUrl = process.env.ESEWA_EPAY_URL;
  const serverBaseUrl = process.env.SERVER_URL; // e.g., http://localhost:5000

  if (!merchantCode || !secretKey || !esewaEpayUrl || !serverBaseUrl) {
    console.error("Missing eSewa configuration in environment variables.");
    throw new Error("Server configuration error for eSewa payment.");
  }

  // Add /v1 to the callback path
  const successUrl = `${serverBaseUrl}/api/v1/bookings/callback/esewa?status=success`;
  const failureUrl = `${serverBaseUrl}/api/v1/bookings/callback/esewa?status=failure`;

  const signatureBaseString = `total_amount=${totalAmount},transaction_uuid=${transactionId},product_code=${merchantCode}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(signatureBaseString);
  const signature = hmac.digest("base64");

  const formData = {
    amount: totalAmount,
    tax_amount: 0,
    total_amount: totalAmount,
    transaction_uuid: transactionId,
    product_code: merchantCode,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: signature,
  };

  console.log("Prepared eSewa form data for transaction:", transactionId);
  // Return the URL under the key 'paymentUrl' as expected by frontend
  return { formData, paymentUrl: esewaEpayUrl, paymentId: transactionId };
};

/**
 * Verifies payment with the gateway after callback/redirect.
 * @param {String} gateway - The payment gateway identifier ('esewa').
 * @param {Object} paymentData - Data received from the gateway callback (e.g., { transactionId, refId, callbackStatus }).
 * @returns {Promise<Object>} Result object { success: boolean, booking?: Booking, message?: string }.
 */
const verifyPayment = async (gateway, paymentData) => {
  const { transactionId } = paymentData;

  if (!transactionId) {
    console.error(
      "Verification failed: Missing transactionId in callback data",
      paymentData
    );
    return {
      success: false,
      message: "Missing transaction identifier in callback.",
    };
  }

  const booking = await Booking.findOne({ transactionId: transactionId });

  if (!booking) {
    console.error(
      "Verification failed: Booking not found for transactionId:",
      transactionId
    );
    return {
      success: false,
      message: `Booking not found for transaction ${transactionId}.`,
    };
  }

  // Prevent reprocessing already completed/failed payments
  if (
    booking.paymentStatus === "succeeded" ||
    booking.paymentStatus === "failed"
  ) {
    console.warn(
      `Attempted to re-verify booking ${booking._id} with status ${booking.paymentStatus}`
    );
    // Return success true but indicate it was already processed? Or false?
    // Let's treat it as success as the final state is known.
    return {
      success: booking.paymentStatus === "succeeded",
      booking: booking,
      message: `Booking already ${booking.status}.`,
    };
  }
  if (booking.status !== "pending" || booking.paymentStatus !== "initiated") {
    console.error(
      `Verification failed: Booking ${booking._id} has unexpected status: ${booking.status}/${booking.paymentStatus}`
    );
    // Mark as failed just in case? Or leave as is? Let's mark as failed.
    booking.status = "failed";
    booking.paymentStatus = "failed";
    await booking.save();
    return {
      success: false,
      message: `Booking has unexpected status: ${booking.status}/${booking.paymentStatus}. Marked as failed.`,
    };
  }

  try {
    if (gateway === "esewa") {
      return await verifyEsewaPayment(booking, paymentData);
    } else if (gateway === "khalti") {
      // TODO: Implement Khalti verification
      throw new Error("Khalti verification not yet implemented.");
    } else {
      throw new Error("Invalid payment gateway specified for verification.");
    }
  } catch (error) {
    console.error(
      `Payment verification error for booking ${booking._id} (${gateway}):`,
      error
    );
    // Ensure booking is marked as failed on verification error
    booking.status = "failed";
    booking.paymentStatus = "failed";
    await booking.save();
    return {
      success: false,
      message: `Error during payment verification: ${error.message}`,
    };
  }
};

/**
 * Verify eSewa payment via their status check API.
 * @param {Booking} booking - The Mongoose booking document.
 * @param {Object} paymentData - Data from callback, including refId.
 * @returns {Promise<Object>} Result object { success: boolean, booking?: Booking, message?: string }.
 */
const verifyEsewaPayment = async (booking, paymentData) => {
  const { refId, callbackStatus } = paymentData; // refId might be from query or decoded data

  // If the callback URL itself indicated failure, don't bother verifying API
  if (callbackStatus === "failure") {
    console.log(`eSewa callback indicated failure for booking ${booking._id}.`);
    booking.status = "failed";
    booking.paymentStatus = "failed";
    await booking.save();
    return {
      success: false,
      booking,
      message: "Payment failed or was cancelled by user.",
    };
  }

  const merchantCode = process.env.ESEWA_MERCHANT_CODE;
  const verifyUrl = process.env.ESEWA_VERIFY_URL;

  if (!merchantCode || !verifyUrl) {
    console.error("Missing eSewa verification configuration.");
    throw new Error("Server configuration error for eSewa verification.");
  }

  const verificationUrl = `${verifyUrl}?product_code=${merchantCode}&total_amount=${booking.totalAmount}&transaction_uuid=${booking.transactionId}`;
  console.log(
    "Verifying eSewa payment for transaction:",
    booking.transactionId,
    "at:",
    verificationUrl
  );

  try {
    const response = await axios.get(verificationUrl);
    console.log("eSewa Verification API Response:", response.data);

    if (response.data && response.data.status === "COMPLETE") {
      console.log(
        `Verification successful for booking ${booking._id}. Attempting to confirm.`
      );

      // --- Non-transactional Update Start ---
      try {
        // Find the trip to check seats BEFORE decrementing
        const trip = await Trip.findById(booking.tripId);
        if (!trip) {
          console.error(
            `Confirmation Error: Trip ${booking.tripId} not found for booking ${booking._id}`
          );
          throw new Error("Associated trip not found.");
        }
        if (trip.availableSeats < booking.numberOfPersons) {
          console.error(
            `Confirmation Error: Not enough seats (${trip.availableSeats}) for booking ${booking._id} requiring ${booking.numberOfPersons}`
          );
          throw new Error("Not enough seats available on the trip.");
        }

        // Decrement available seats on the trip (Not atomic with booking save anymore)
        const tripUpdate = await Trip.findByIdAndUpdate(
          booking.tripId,
          { $inc: { availableSeats: -booking.numberOfPersons } },
          { new: true } // Removed session
        );

        // Basic check after update (less robust than transaction rollback)
        if (!tripUpdate || tripUpdate.availableSeats < 0) {
          console.error(
            `Seat Update Error: Failed to decrement seats or seats became negative for Trip ${booking.tripId}.`
          );
          // Attempt to revert booking status? Or leave as pending?
          // For simplicity, leave booking as pending/initiated and report error
          // A more robust solution might try to re-increment seats, but adds complexity.
          throw new Error("Seat update failed after payment verification.");
        }

        // Update the booking status
        booking.status = "confirmed";
        booking.paymentStatus = "succeeded";
        booking.paymentGatewayRef = response.data.ref_id || refId || "N/A";
        booking.updatedAt = Date.now();
        await booking.save(); // Removed session

        console.log(
          `Booking ${booking._id} confirmed and seats updated for Trip ${tripUpdate._id}.`
        );
        return { success: true, booking: booking };
      } catch (updateError) {
        // If update logic fails after successful verification
        console.error(
          `Error during post-verification update for booking ${booking._id}:`,
          updateError
        );
        // Mark booking as failed as confirmation process didn't complete
        booking.status = "failed";
        booking.paymentStatus = "failed"; // Reflects verification ok, but internal error
        booking.message = `Confirmation processing failed: ${updateError.message}`;
        await booking.save(); // Save the failed status
        return {
          success: false,
          booking,
          message: `Booking confirmation failed: ${updateError.message}`,
        };
      }
      // --- Non-transactional Update End ---
    } else {
      // Verification API did not return 'COMPLETE'
      console.warn(
        `eSewa verification for ${booking.transactionId} returned status: ${response.data?.status}. Marking booking as failed.`
      );
      booking.status = "failed";
      booking.paymentStatus = "failed";
      await booking.save(); // Removed session
      return {
        success: false,
        booking,
        message: `Payment verification status: ${
          response.data?.status || "Unknown"
        }.`,
      };
    }
  } catch (apiError) {
    console.error(
      `Error calling eSewa verification API for ${booking.transactionId}:`,
      apiError.message
    );
    throw new Error(
      `eSewa verification API request failed: ${apiError.message}`
    ); // Caught by verifyPayment
  }
};

/**
 * Get all bookings for a user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} List of bookings
 */
const getUserBookings = async (userId) => {
  try {
    // Updated populate to use tripId and fetch relevant Trip fields
    const bookings = await Booking.find({ userId })
      .sort({ bookingDate: -1 })
      .populate(
        "tripId",
        "title location startDate durationDays pricePerPerson images rideId"
      ) // Use tripId now
      .exec();
    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

/**
 * Get a booking by ID
 * @param {String} bookingId - Booking ID (_id)
 * @returns {Promise<Object|null>} Booking or null if not found
 */
const getBookingById = async (bookingId) => {
  try {
    // Updated populate to use tripId
    const booking = await Booking.findById(bookingId)
      .populate(
        "tripId",
        "title location startDate durationDays pricePerPerson images itinerary rideId" // Use tripId
      )
      .populate("userId", "username email") // Optionally populate user details
      .exec();
    return booking;
  } catch (error) {
    console.error(`Error fetching booking by ID ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Cancel a booking (updates status to Cancelled and increments seats if applicable)
 * @param {String} bookingId - Booking ID (_id)
 * @param {String} userId - User ID performing the cancellation (for ownership check)
 * @returns {Promise<Object|null>} Updated booking or null if not found/authorized
 */
const cancelBooking = async (bookingId, userId) => {
  try {
    // Ensure user owns booking
    const booking = await Booking.findOne({ _id: bookingId, userId: userId }); // Removed session

    if (!booking) {
      return null; // Or throw new Error("Booking not found or user not authorized");
    }

    // Prevent cancelling already cancelled or failed bookings
    if (booking.status === "cancelled" || booking.status === "failed") {
      console.log(
        `Booking ${bookingId} is already ${booking.status}, no action taken.`
      );
      return booking; // Return current state
    }

    const previousStatus = booking.status;
    booking.status = "cancelled";
    booking.updatedAt = Date.now();

    // Only increment seats if the booking was previously confirmed
    if (previousStatus === "confirmed") {
      // Non-transactional update
      const tripUpdate = await Trip.findByIdAndUpdate(
        booking.tripId,
        { $inc: { availableSeats: booking.numberOfPersons } },
        { new: true } // Removed session
      );
      if (!tripUpdate) {
        console.error(
          `Cancellation Error: Failed to find trip ${booking.tripId} while incrementing seats for booking ${bookingId}`
        );
        // Don't throw here, proceed to save booking as cancelled, but log the seat issue.
      } else {
        console.log(
          `Incremented seats for Trip ${booking.tripId} due to cancellation of Booking ${bookingId}. New count: ${tripUpdate.availableSeats}`
        );
      }
    }

    await booking.save(); // Removed session

    return booking;
  } catch (error) {
    console.error(`Error cancelling booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * ADMIN: Get all bookings, populated with User and Trip details
 * @returns {Promise<Array>} List of all bookings
 */
const getAllBookingsPopulated = async () => {
  try {
    const bookings = await Booking.find({})
      .sort({ bookingDate: -1 })
      .populate("userId", "username email") // Populate user details
      .populate("tripId", "title location startDate rideId") // Populate trip details (using tripId)
      .exec();
    return bookings;
  } catch (error) {
    console.error("Error fetching all populated bookings:", error);
    throw error;
  }
};

/**
 * ADMIN: Cancel a booking by ID (increments seats if applicable)
 * @param {String} bookingId - Booking ID to cancel
 * @returns {Promise<Object|null>} Updated booking or null if not found
 */
const adminCancelBookingById = async (bookingId) => {
  try {
    // Find the booking
    const booking = await Booking.findById(bookingId); // Removed session

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check if already cancelled or failed
    if (booking.status === "cancelled" || booking.status === "failed") {
      console.log(
        `Admin: Booking ${bookingId} is already ${booking.status}, no action taken.`
      );
      return booking;
    }

    const previousStatus = booking.status;
    booking.status = "cancelled";
    booking.updatedAt = Date.now();

    // Increment Seats if Booking was Confirmed
    if (previousStatus === "confirmed") {
      console.log(
        `Admin: Attempting to increment seats for confirmed booking ${bookingId} cancellation.`
      );
      // Non-transactional update
      const tripUpdate = await Trip.findByIdAndUpdate(
        booking.tripId,
        { $inc: { availableSeats: booking.numberOfPersons } },
        { new: true } // Removed session
      );
      if (!tripUpdate) {
        console.error(
          `Admin Error: Failed to find trip ${booking.tripId} during cancellation of Booking ${bookingId}`
        );
        // Proceed to save booking cancellation but log error
      } else {
        console.log(
          `Admin: Incremented seats for Trip ${tripUpdate._id} by ${booking.numberOfPersons}. New count: ${tripUpdate.availableSeats}`
        );
      }
    } else {
      console.log(
        `Admin: Booking ${bookingId} status was ${previousStatus}, not incrementing seats.`
      );
    }

    // Save Updated Booking
    await booking.save(); // Removed session
    console.log(`Admin: Saved cancelled status for booking ${bookingId}`);

    return booking;
  } catch (error) {
    console.error(`Admin Error cancelling booking ${bookingId}:`, error);
    throw error;
  }
};

module.exports = {
  // New functions
  initiateBooking,
  verifyPayment,
  // Existing functions (potentially refactored)
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookingsPopulated,
  adminCancelBookingById,
};
