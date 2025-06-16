// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  // Expect firstName and lastName directly
  const { firstName, lastName, username, email, password, address } = req.body;

  try {
    // Basic Validation - Check for firstName and lastName
    if (!firstName || !lastName || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter all required fields" });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or username" });
    }

    // Create new user instance (password hashed automatically by pre-save hook)
    user = new User({
      firstName, // Use directly
      lastName, // Use directly
      username,
      email,
      password,
      // address, // address is not in the User model, Mongoose will ignore it
    });

    await user.save();

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" }, // Token expiration
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          userId: user.id,
          username: user.username,
          role: user.role,
        }); // Send token and basic user info
      }
    );
  } catch (err) {
    console.error("Register Error:", err.message);
    // Check for Mongoose validation errors
    if (err.name === "ValidationError") {
      // Send a more specific validation error message
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  console.log("📥 Login request received");
  console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

  const { emailOrUsername, password } = req.body;

  try {
    // Basic Validation
    if (!emailOrUsername || !password) {
      console.log("❌ Validation failed - Missing fields");
      return res
        .status(400)
        .json({ message: "Please provide email/username and password" });
    }

    console.log(`🔍 Looking for user with email/username: ${emailOrUsername}`);

    // Check for user by email or username, **explicitly selecting password**
    let user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select("+password");

    if (!user) {
      console.log(`⚠️ User not found with email/username: ${emailOrUsername}`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    console.log(`✅ User found: ${user.username} (ID: ${user._id})`);
    console.log(`🔑 Checking password match for user: ${user.username}`);

    // Compare password
    const isMatch = await user.matchPassword(password);

    console.log(`🔒 Password match result: ${isMatch ? "Success" : "Failed"}`);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    console.log(`🎫 Creating JWT token for user: ${user.username}`);

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) {
          console.error("❌ Token generation error:", err);
          throw err;
        }

        console.log(`🔑 Login successful for: ${user.username}`);
        console.log("📤 Returning user data and token");

        res.json({
          token,
          userId: user.id,
          username: user.username,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`.trim(),
        }); // Send token and basic user info
      }
    );
  } catch (err) {
    console.error("❌ Login Error:", err);

    if (err.name === "ValidationError") {
      console.error("Validation Error Details:", err.errors);
    } else if (err.code === 11000) {
      console.error("Duplicate Key Error:", err.keyValue);
    }

    res.status(500).send("Server error");
  }
});

module.exports = router;
