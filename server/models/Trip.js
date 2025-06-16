// server/models/Trip.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import UUID generator

// Define a sub-schema for structured locations
const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "Thamel Apartment, Kathmandu, TH, Nepal"
    // Coordinates stored in [longitude, latitude] order (GeoJSON standard)
    coordinates: {
      type: [Number], // Array of numbers
      required: true,
      validate: [
        (val) => val.length === 2,
        "Coordinates array must contain exactly 2 numbers [lng, lat]",
      ],
      // Consider adding index: '2dsphere' later if geospatial queries are needed
    },
  },
  { _id: false }
); // Don't create separate IDs for location subdocuments

const tripSchema = new mongoose.Schema(
  {
    rideId: {
      type: String,

      unique: true,
      index: true,
      default: uuidv4,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      // Use the LocationSchema for the main location
      type: LocationSchema,
      required: [true, "Location details (name and coordinates) are required"],
    },
    meetUpPoint: {
      // Add the meetUpPoint field using LocationSchema
      type: LocationSchema,
      required: false, // Keep optional based on previous frontend logic
    },
    startDate: {
      type: Date,
      default: null,
    },
    durationDays: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 day"],
    },
    maxParticipants: {
      type: Number,
      required: [true, "Maximum number of participants is required"],
      min: [1, "Must allow at least 1 participant"],
      default: 10,
    },
    availableSeats: {
      type: Number,
      min: [0, "Available seats cannot be negative"],
    },
    pricePerPerson: {
      type: Number,
      required: [true, "Price per person is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    distance: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult", "Strenuous"],
      default: "Moderate",
    },
    transportType: {
      type: String,
      enum: ["Car", "Motorcycle", "Bicycle", "Mixed"],
      default: "Mixed",
    },
    images: [String],
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },
        location: {
          // Use the LocationSchema for itinerary location
          type: LocationSchema,
          required: [
            true,
            "Itinerary day location details (name and coordinates) are required",
          ],
        },
        activities: [String],
        lodging: String,
        notes: String,
      },
    ],
    route: [
      {
        lat: Number,
        lng: Number,
        description: String,
      },
    ],

    tags: [String],
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false, // User-created plans are private by default
      index: true, // Index for faster filtering of public trips
    },
    isBookable: {
      // New flag
      type: Boolean,
      default: false, // User plans are not bookable by default
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.pre("save", function (next) {
  if (this.isNew && typeof this.availableSeats === "undefined") {
    this.availableSeats = this.maxParticipants;
  }
  // Ensure available seats doesn't exceed max participants if updated
  if (this.availableSeats > this.maxParticipants) {
    this.availableSeats = this.maxParticipants;
  }
  next();
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
