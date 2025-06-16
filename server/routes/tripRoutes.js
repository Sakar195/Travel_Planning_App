// server/routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const tripController = require("../controllers/tripController");
const {
  protect,
  admin,
  optionalProtect,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

// Define BEFORE routes with /:id to avoid conflicts
// @route   GET /api/trips/my-trips
// @desc    Get trips created by the logged-in user
// @access  Private
router.get("/my-trips", protect, tripController.getMyTrips);

// @route   GET /api/trips
// @desc    Get all trips (defaults to public, admins see all)
// @access  Public (conditionally checks auth)
router.get("/", optionalProtect, tripController.getAllTrips);

// @route   GET /api/trips/:id
// @desc    Get a trip by ID
// @access  Public
router.get("/:id", tripController.getTripById);

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private (Authenticated Users)
router.post(
  "/",
  protect,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("location").isObject().withMessage("Location must be an object"),
    body("location.name")
      .notEmpty()
      .isString()
      .withMessage("Location name is required"),
    body("location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage(
        "Location coordinates must be an array of 2 numbers [lng, lat]"
      ),
    body("location.coordinates.*")
      .isNumeric()
      .withMessage("Coordinates must contain only numbers"),
    body("itinerary")
      .isArray({ min: 1 })
      .withMessage("Itinerary must be a non-empty array"),
    body("itinerary.*.day").isNumeric().withMessage("Day must be a number"),
    body("itinerary.*.location")
      .isObject()
      .withMessage("Itinerary location must be an object"),
    body("itinerary.*.location.name")
      .notEmpty()
      .isString()
      .withMessage("Itinerary location name is required"),
    body("itinerary.*.location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage(
        "Itinerary location coordinates must be an array of 2 numbers [lng, lat]"
      ),
    body("itinerary.*.location.coordinates.*")
      .isNumeric()
      .withMessage("Itinerary coordinates must contain only numbers"),
    body("itinerary.*.activities")
      .optional()
      .isArray()
      .withMessage("Activities must be an array"),
    body("itinerary.*.lodging")
      .optional()
      .isString()
      .withMessage("Lodging must be a string"),
    body("itinerary.*.notes")
      .optional()
      .isString()
      .withMessage("Notes must be a string"),
    body("startDate")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate()
      .withMessage("Invalid start date format"),
    body("durationDays")
      .notEmpty()
      .withMessage("Duration is required")
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("distance")
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage("Distance must be a non-negative number"),
    body("difficulty")
      .optional()
      .isString()
      .isIn(["Easy", "Moderate", "Difficult", "Strenuous"])
      .withMessage("Invalid difficulty value"),
    body("transportType")
      .optional()
      .isString()
      .withMessage("Transport type must be a string"),
    body("meetUpPoint")
      .optional()
      .isObject()
      .withMessage("MeetUpPoint must be an object"),
    body("meetUpPoint.name")
      .optional()
      .notEmpty()
      .isString()
      .withMessage("MeetUpPoint name cannot be empty if provided"),
    body("meetUpPoint.coordinates")
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage(
        "MeetUpPoint coordinates must be an array of 2 numbers [lng, lat] if provided"
      ),
    body("meetUpPoint.coordinates.*")
      .optional()
      .isNumeric()
      .withMessage(
        "MeetUpPoint coordinates must contain only numbers if provided"
      ),
    body("route").optional().isArray().withMessage("Route must be an array"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("tags.*").optional().isString().trim(),
    body("images").optional().isArray().withMessage("Images must be an array"),
    body("images.*")
      .optional()
      .isString()
      .withMessage("Each image must be a valid string"),
  ],
  validate,
  tripController.createTrip
);

// @route   PUT /api/trips/:id
// @desc    Update a trip
// @access  Private (Admin or Creator)
// NOTE: The controller (updateTrip) already checks if the user is the creator.
// We might only need admin here if admins should bypass the creator check.
// For now, let's assume only Admins can update ANY trip via this route specifically.
router.put(
  "/:id",
  protect,
  admin,
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("location")
      .optional()
      .isObject()
      .withMessage("Location must be an object"),
    body("location.name")
      .optional()
      .notEmpty()
      .isString()
      .withMessage("Location name cannot be empty"),
    body("location.coordinates")
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage(
        "Location coordinates must be an array of 2 numbers [lng, lat]"
      ),
    body("location.coordinates.*")
      .optional()
      .isNumeric()
      .withMessage("Coordinates must contain only numbers"),
    body("durationDays")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("itinerary")
      .optional()
      .isArray()
      .withMessage("Itinerary must be an array"),
    body("route").optional().isArray().withMessage("Route must be an array"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  validate,
  tripController.updateTrip
);

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Private (Admin or Creator)
// NOTE: The controller (deleteTrip) already checks if the user is the creator.
// We might only need admin here if admins should bypass the creator check.
// For now, let's assume only Admins can delete ANY trip via this route specifically.
router.delete("/:id", protect, tripController.deleteTrip);

module.exports = router;
