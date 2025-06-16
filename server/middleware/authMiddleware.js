// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path if needed

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.user.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next(); // Move to the next middleware/route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check for Admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" }); // 403 Forbidden
  }
};

// Middleware to optionally attach user if token is valid
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select("-password");
      // If user not found after decoding, just proceed without setting req.user
      // Do not throw error here, just proceed
    } catch (error) {
      // Token invalid/expired, or user deleted - just ignore and proceed
      // console.warn("Optional protect: Token validation failed or user not found.");
      req.user = null; // Explicitly set to null on error
    }
  } else {
    req.user = null; // No token, set user to null
  }

  next(); // Always call next, regardless of authentication status
};

module.exports = { protect, admin, optionalProtect };
