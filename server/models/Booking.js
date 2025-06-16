// server/models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Rename rideId to tripId
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },

  numberOfPersons: {
    type: Number,
    required: [true, "Number of persons is required"],
    min: [1, "At least one person must be booked"],
    default: 1,
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"],
  },
  // Fields for payment integration
  transactionId: {
    // Our internal unique ID for this payment attempt
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  paymentGatewayRef: {
    // ID from eSewa/Khalti (e.g., refId, pidx)
    type: String,
    index: true, // Index for potential lookups
    default: null,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["esewa", "khalti"],
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["pending", "initiated", "succeeded", "failed"],
    default: "pending",
  },
  bookingDate: { type: Date, default: Date.now },
  // Update status enum
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
