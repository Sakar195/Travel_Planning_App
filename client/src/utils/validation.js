/**
 * Utility functions for validation
 */

/**
 * Validates if a string is a valid MongoDB ObjectId or UUID
 * @param {string} str - The string to check
 * @returns {boolean} True if valid ObjectId/UUID format, false otherwise
 */
export const isValidObjectId = (str) => {
  // MongoDB ObjectId is a 24 character hex string
  if (/^[0-9a-fA-F]{24}$/.test(str)) {
    return true;
  }
  // UUID format (supporting both with and without dashes)
  if (
    /^[0-9a-fA-F]{32}$/.test(str) ||
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      str
    )
  ) {
    return true;
  }
  return false;
};

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format, false otherwise
 */
export const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates if a string is not empty (after trimming)
 * @param {string} str - The string to check
 * @returns {boolean} True if not empty, false otherwise
 */
export const isNotEmpty = (str) => {
  return str && str.trim().length > 0;
};

/**
 * Validates a password strength
 * @param {string} password - The password to validate
 * @returns {Object} Object with isValid boolean and message string
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  return {
    isValid: true,
    message: "Password is strong",
  };
};
