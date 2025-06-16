const asyncHandler = require("express-async-handler"); // Simple middleware for handling exceptions inside of async express routes
const { body, validationResult } = require("express-validator"); // For input validation
const UserService = require("../services/userService");
const User = require("../models/User"); // Sometimes needed for direct checks
const mongoose = require("mongoose"); // Needed for ObjectId validation
const bcrypt = require("bcryptjs"); // <-- Need bcrypt for password comparison and hashing

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is attached by the protect middleware
  const userId = req.user._id;

  // We could re-fetch the user, but req.user (if populated correctly) might be sufficient
  // Let's re-fetch to ensure we have the latest data and exclude password via toJSON
  const user = await User.findById(userId);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Ensure password is not sent (handled by toJSON in model)
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  // Validation handled by middleware defined in routes
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user._id;
  const { firstName, lastName, username, profilePicture } = req.body;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (username !== undefined) updateData.username = username;
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error("No valid fields provided for update");
  }

  try {
    const updatedUser = await UserService.updateUser(userId, updateData);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error("User not found during update");
    }
  } catch (error) {
    // Handle potential duplicate username error from service/mongoose
    if (
      error.message.includes("duplicate key error") &&
      error.message.includes("username")
    ) {
      res.status(400);
      throw new Error("Username already exists");
    }
    // Re-throw other errors for the main error handler
    throw error;
  }
});

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors from the route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id; // Get user ID from protect middleware

  // Find the user but select the password field explicitly
  const user = await User.findById(userId).select("+password");

  if (!user) {
    // This shouldn't happen if protect middleware is working, but check anyway
    res.status(404);
    throw new Error("User not found.");
  }

  // Check if current password matches
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401); // Use 401 Unauthorized for incorrect password
    throw new Error("Incorrect current password.");
  }

  // Hash the new password (assuming pre-save hook in User model handles hashing)
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully." });
});

// --- Admin Controllers ---

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400); // Bad request for invalid ID format
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(userId).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Update user by ID (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID format");
  }

  const { firstName, lastName, username, email, role } = req.body;

  // Fields admin is allowed to update
  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email; // Admin can change email
  if (role && ["user", "admin"].includes(role)) {
    // Validate role
    updateData.role = role;
  } else if (role) {
    res.status(400);
    throw new Error("Invalid role specified. Must be 'user' or 'admin'.");
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error("No valid fields provided for update");
  }

  // Prevent admin from changing their own role (simple check)
  const userToUpdate = await User.findById(userId).select("role"); // Fetch only necessary fields
  if (!userToUpdate) {
    res.status(404);
    throw new Error("User not found");
  }
  if (
    userId === req.user._id.toString() &&
    updateData.role &&
    updateData.role !== userToUpdate.role
  ) {
    res.status(400);
    throw new Error("Admins cannot change their own role.");
  }

  try {
    // Using findByIdAndUpdate directly for admin updates as UserService.updateUser restricts fields
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found after update attempt"); // Should not happen if initial check passed
    }
    res.json(updatedUser);
  } catch (error) {
    // Handle potential duplicate key errors (email, username)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400);
      throw new Error(`An account with that ${field} already exists.`);
    }
    // Handle validation errors (e.g., invalid email format)
    if (error.name === "ValidationError") {
      res.status(400);
      // Extract a more specific message if possible
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new Error(`Validation Failed: ${messages.join(", ")}`);
    }
    throw error; // Re-throw other errors
  }
});

/**
 * @desc    Delete user by ID (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent admin from deleting themselves
  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error("Admin cannot delete their own account.");
  }

  // TODO: Decide on handling associated data (Rides, Bookings, Media)
  // Option 1: Delete associated data
  // Option 2: Reassign (e.g., to a generic 'deleted user' account)
  // Option 3: Leave as is (may lead to orphaned data)

  await User.findByIdAndDelete(userId);

  res.json({ message: "User removed successfully" });
});

/**
 * ADMIN: Create a new user
 * @route POST /api/users/admin/create
 * @access Private/Admin
 */
const adminCreateUser = async (req, res, next) => {
  const { username, email, password, role, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email or username already exists");
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password, // Password will be hashed by the pre-save hook in the User model
      role: role || "user", // Default to 'user' if role not provided
      firstName,
      lastName,
    });

    if (user) {
      // Respond with created user data (excluding password)
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  adminCreateUser,
};
