// server/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
// const { body } = require("express-validator"); // Use validation middleware directly if needed
const {
  initiateBookingController,
  handleGatewayCallbackController,
  getUserBookingsController,
  getBookingByIdController,
  cancelBookingController,
  adminGetAllBookingsController,
  adminCancelBookingController,
} = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  validateBookingInitiation,
} = require("../middleware/validationMiddleware"); // Assuming a specific validator

// --- Payment Related Routes ---

// @route   POST /api/bookings/initiate
// @desc    Initiate a booking and get payment details
// @access  Private
router.post(
  "/initiate",
  protect,
  validateBookingInitiation, // Add validation middleware
  initiateBookingController
);

// @route   GET /api/bookings/callback/:gateway
// @desc    Handle payment gateway callback (eSewa, Khalti, etc.)
// @access  Public
router.get("/callback/:gateway", handleGatewayCallbackController);

// --- User Booking Management Routes ---

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for the authenticated user
// @access  Private
router.get("/my-bookings", protect, getUserBookingsController);

// @route   GET /api/bookings/:id
// @desc    Get a specific booking by ID
// @access  Private
router.get("/:id", protect, getBookingByIdController);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put("/:id/cancel", protect, cancelBookingController);

// --- Admin Routes ---
// These should ideally be in a separate admin route file (e.g., adminBookingRoutes.js)
// but keeping them here for now as per original structure.

// @route   GET /api/bookings/admin/all
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
router.get("/admin/all", protect, admin, adminGetAllBookingsController);

// @route   PUT /api/bookings/admin/cancel/:id
// @desc    Admin cancels a booking
// @access  Private/Admin
router.put("/admin/cancel/:id", protect, admin, adminCancelBookingController);

// Remove the old POST / route
/*
router.post(
  "/",
  protect,
  [
    body("rideId").isMongoId().withMessage("Valid ride ID is required"),
    body("serviceType")
      .isIn(["Accommodation", "Activity", "Full Package"])
      .withMessage(
        "Service type must be Accommodation, Activity, or Full Package"
      ),
    body("serviceDetails")
      .isObject()
      .withMessage("Service details are required"),
  ],
  validate,
  bookingController.createBooking // Old controller
);
*/

module.exports = router;
