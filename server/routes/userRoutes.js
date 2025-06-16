// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator"); // Import validator
const {
  getUserProfile,
  updateUserProfile,
  changePassword, // <-- Import the new controller function
  getAllUsers, // Import admin controllers
  getUserById,
  updateUserById,
  deleteUserById,
  adminCreateUser, // Assuming the controller is imported as userController
} = require("../controllers/userController");
const User = require("../models/User"); // Keep for admin routes
const { protect, admin } = require("../middleware/authMiddleware");

// --- User Profile Routes (for logged-in user) ---

// @route   GET /api/users/profile
// @desc    Get logged-in user profile
// @access  Private
router.route("/profile").get(protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update logged-in user profile
// @access  Private
router.route("/profile").put(
  protect,
  [
    // Add validation middleware
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty if provided"),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name cannot be empty if provided"),
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long if provided"),
    // Add more validation as needed for profilePicture (e.g., isURL?)
  ],
  updateUserProfile
);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.route("/change-password").put(
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
    // You can add more complex password validation rules here if needed
  ],
  changePassword // <-- Use the new controller function
);

// --- Admin Routes (for managing all users) ---
// Note: Consider moving these to a separate adminRoutes.js for better organization

// @route   POST /api/users/admin/create
// @desc    Create a new user (Admin only)
// @access  Private/Admin
router.post(
  "/admin/create",
  protect,
  admin,
  [
    // Add validation for admin user creation
    body("username", "Username is required").trim().notEmpty(),
    body("email", "Please include a valid email").isEmail().normalizeEmail(),
    body("password", "Password must be at least 8 characters").isLength({
      min: 8,
    }),
    body("role", "Role must be either user or admin")
      .optional()
      .isIn(["user", "admin"]),
    body("firstName").optional().trim(),
    body("lastName").optional().trim(),
  ],
  adminCreateUser // Assuming controller is imported as userController
);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.route("/").get(protect, admin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(
    protect,
    admin,
    [
      // Validation for admin updates
      body("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
      body("firstName").optional().trim().notEmpty(),
      body("lastName").optional().trim().notEmpty(),
      body("username").optional().trim().isLength({ min: 3 }),
      body("role")
        .optional()
        .isIn(["user", "admin"])
        .withMessage("Invalid role"),
    ],
    updateUserById
  )
  .delete(protect, admin, deleteUserById);

module.exports = router;
