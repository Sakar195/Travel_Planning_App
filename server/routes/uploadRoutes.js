// server/routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure the uploads directory exists
// __dirname is available directly in CommonJS
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
} else {
  console.log(`Uploads directory already exists: ${uploadsDir}`);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Save files to server/uploads/
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Configure multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: fileFilter,
});

// Define the upload route
// Handles multiple files uploaded under the 'images' field
router.post(
  "/images",
  upload.array("images", 10),
  (req, res, next) => {
    // Allow up to 10 images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images were uploaded." });
    }

    console.log("Files received:", req.files);

    // Construct the URLs for the uploaded files
    // IMPORTANT: This assumes your server serves static files from the 'uploads' directory
    // Check your server.js static file configuration: app.use('/uploads', express.static('uploads'));
    const serverBaseUrl = `${req.protocol}://${req.get("host")}`;
    const filesUrls = req.files.map((file) => {
      const relativePath = `/uploads/${file.filename}`;
      return `${serverBaseUrl}${relativePath}`;
    });

    console.log("Generated Image URLs:", filesUrls);

    // Respond with the array of URLs
    res.status(200).json({ urls: filesUrls });
  },
  (error, req, res, next) => {
    // Multer error handling
    if (error instanceof multer.MulterError) {
      console.error("Multer error:", error);
      return res
        .status(400)
        .json({ message: `Multer error: ${error.message}` });
    } else if (error) {
      // Custom errors (like file filter) or other unexpected errors
      console.error("Upload error:", error);
      return res
        .status(400)
        .json({ message: error.message || "File upload failed." });
    }
    next(); // Should not be reached if error occurred, but good practice
  }
);

module.exports = router; // Use module.exports for CommonJS
