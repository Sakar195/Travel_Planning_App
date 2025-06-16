const { validationResult, body } = require("express-validator");

/**
 * Express validator middleware
 * Checks for validation errors from express-validator and returns them as response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for the booking initiation endpoint
const validateBookingInitiation = [
  body("tripId").isMongoId().withMessage("Valid tripId is required."),
  body("numberOfPersons")
    .isInt({ min: 1 })
    .withMessage("numberOfPersons must be a positive integer."),
  body("paymentMethod")
    .isIn(["esewa", "khalti"]) // Only allow these methods
    .withMessage("Invalid paymentMethod. Must be 'esewa' or 'khalti'.")
    .toLowerCase(), // Convert to lowercase before validation/use
  validate, // Apply the generic validation checker after the rules
];

module.exports = {
  validate, // Keep exporting the generic validator if used elsewhere
  validateBookingInitiation, // Export the specific validation chain
};
