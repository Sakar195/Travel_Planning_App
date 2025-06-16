// server/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

// Generate userId before saving
UserSchema.pre("save", async function (next) {
  // Only set userId if it doesn't exist
  if (!this.userId) {
    this.userId = this._id.toString();
  }
  next();
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Proceed with saving
  } catch (error) {
    console.error("Error hashing password in pre-save hook:", error);
    next(error); // Pass the error to Mongoose, potentially stopping the save
  }
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("🔍 matchPassword called, comparing passwords");
  console.log("👤 User:", this.username);
  console.log(
    "🔑 Stored password hash length:",
    this.password?.length || "No password"
  );
  console.log(
    "🔒 Entered password length:",
    enteredPassword?.length || "No password entered"
  );

  if (!enteredPassword || !this.password) {
    console.log("❌ Missing password or hash");
    return false;
  }

  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log(
      `🔐 Password comparison result: ${result ? "Match" : "No match"}`
    );
    return result;
  } catch (error) {
    console.error("❌ Error comparing password:", error);
    return false;
  }
};

// Prevent password from being sent in responses
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
