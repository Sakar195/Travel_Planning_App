const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Creates a new user in the database.
 * @param {object} userData - User data (firstName, lastName, username, email, password).
 * @returns {Promise<User>} The created user document (without password).
 * @throws {Error} If validation fails or email/username already exists.
 */
const createUser = async (userData) => {
  try {
    // Note: Password hashing is handled by the pre-save hook in the User model
    const user = new User(userData);
    await user.save();
    // user.toJSON() is automatically called when sending via res.json()
    // but we call it explicitly here if needed elsewhere
    return user.toJSON ? user.toJSON() : user; // Ensure password isn't returned
  } catch (error) {
    // Enhance error handling for duplicate keys if needed
    if (error.code === 11000) {
      // Determine which field caused the duplicate error
      const field = Object.keys(error.keyValue)[0];
      throw new Error(`An account with that ${field} already exists.`);
    }
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      // Provide a more user-friendly message or specific field errors
      throw new Error(`User validation failed: ${error.message}`);
    }
    console.error("Error creating user:", error);
    throw error; // Re-throw other errors
  }
};

/**
 * Finds a user by their email address.
 * @param {string} email - The email to search for.
 * @returns {Promise<User|null>} The user document or null if not found.
 */
const findUserByEmail = async (email) => {
  try {
    // Select fields explicitly if needed, password needed for comparison later
    // const user = await User.findOne({ email }).select('+password');
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error(`Error finding user by email ${email}:`, error);
    throw error; // Re-throw errors
  }
};

/**
 * Generates a JWT authentication token for a user.
 * @param {string} userId - The ID of the user.
 * @returns {string} The generated JWT token.
 */
const generateAuthToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  if (!userId) {
    throw new Error("User ID is required to generate a token.");
  }
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d", // Default to 30 days
  });
  return token;
};

/**
 * Updates user details.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - The data to update (e.g., { firstName: 'NewName' }).
 * @returns {Promise<User|null>} The updated user document (without password) or null if not found.
 * @throws {Error} If update fails or user not found.
 */
const updateUser = async (userId, updateData) => {
  try {
    // Ensure password cannot be updated directly through this method
    // If password update is needed, create a separate dedicated service function
    if (updateData.password) {
      delete updateData.password;
      console.warn(
        "Attempted to update password via updateUser service. Ignoring."
      );
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    if (!user) {
      // Consider throwing a custom "NotFound" error
      return null;
    }

    return user.toJSON ? user.toJSON() : user; // Ensure password isn't returned
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    // Handle specific errors like validation errors if needed
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  generateAuthToken,
  updateUser,
};
