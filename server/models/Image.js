// server/models/Image.js - Media model per requirements
const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  mediaId: { type: String, unique: true }, // Unique identifier
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    // Optional as per requirements
  },
  mediaType: {
    type: String,
    enum: ["Photo", "Video"],
    required: true,
  },
  mediaUrl: { type: String, required: true }, // Path or URL
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Generate mediaId before saving
ImageSchema.pre("save", async function (next) {
  if (!this.mediaId) {
    this.mediaId = this._id.toString();
  }
  next();
});

module.exports = mongoose.models.Image || mongoose.model("Image", ImageSchema);
