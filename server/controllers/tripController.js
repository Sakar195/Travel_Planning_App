const tripService = require("../services/tripService");

/**
 * Create a new trip
 * @route POST /api/trips
 * @access Private
 */
const createTrip = async (req, res, next) => {
  try {
    // Add user id to trip data as creator
    const tripData = {
      ...req.body,
      creatorId: req.user.id,
    };

    const trip = await tripService.saveTrip(tripData);
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all trips (with optional filtering/pagination)
 * Defaults to fetching PUBLIC trips only unless specified otherwise.
 * Admins (identified by optionalProtect middleware) will see ALL trips by default.
 * @route GET /api/trips
 * @access Public (enhanced for Admin)
 */
const getAllTrips = async (req, res, next) => {
  // req.user is now potentially populated by optionalProtect middleware
  const user = req.user;

  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      isPublic,
      ...otherFilters
    } = req.query;

    // Prepare the filter object
    let finalFilters = { ...otherFilters };

    // Apply isPublic filter based on query param OR user role
    if (isPublic !== undefined) {
      // User explicitly requested public or private
      if (isPublic === "true") {
        finalFilters.isPublic = true;
      } else if (isPublic === "false") {
        // Allow fetching private if explicitly requested
        // Consider adding further auth check here if needed (e.g., only admin/creator can see isPublic=false)
        finalFilters.isPublic = false;
      }
      // If isPublic is something else, filter is not applied
    } else {
      // Default behavior: Public only, UNLESS user is admin
      if (!user || user.role !== "admin") {
        finalFilters.isPublic = true; // Default to public for non-admins/logged-out users
      }
      // If user is admin and isPublic is undefined, no isPublic filter is applied (admin sees all)
    }

    // --- Remove Logging (optional, or keep for debugging) ---
    console.log(
      "getAllTrips - User (from optionalProtect):",
      user ? { id: user._id, role: user.role } : null
    );
    console.log("getAllTrips - Final Filters:", finalFilters);
    // --- End Logging ---

    const trips = await tripService.findTrips(
      finalFilters,
      parseInt(page),
      parseInt(limit),
      sortBy,
      sortOrder
    );

    // TODO: Fetch total count for pagination headers/metadata
    // const totalTrips = await tripService.countTrips(finalFilters);

    res.status(200).json(trips); // Consider adding pagination metadata
  } catch (error) {
    next(error);
  }
};

/**
 * Get a trip by ID
 * @route GET /api/trips/:id
 * @access Public
 */
const getTripById = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const trip = await tripService.findTrip(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a trip
 * @route PUT /api/trips/:id
 * @access Private
 */
const updateTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;

    // First check if trip exists
    const trip = await tripService.findTrip(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if user is the creator of the trip
    if (trip.creatorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this trip" });
    }

    // Update the trip
    const updatedTrip = await tripService.updateTrip(tripId, req.body);

    res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a trip
 * @route DELETE /api/trips/:id
 * @access Private
 */
const deleteTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;

    // First check if trip exists
    const trip = await tripService.findTrip(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if user is the creator of the trip
    if (trip.creatorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this trip" });
    }

    // Delete the trip
    await tripService.removeTrip(tripId);

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trips created by the currently logged-in user
 * @route GET /api/trips/my-trips
 * @access Private
 */
const getMyTrips = async (req, res, next) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const { page = 1, limit = 10 } = req.query; // Get pagination params

    const trips = await tripService.findTripsByCreator(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // Optionally, get total count for pagination headers
    // const totalTrips = await tripService.countTrips({ creatorId: userId });

    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getMyTrips,
};
