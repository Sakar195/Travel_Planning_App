// server/middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "..", "uploads"); // Go up one level from middleware
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
} else {
  console.log(`Directory exists: ${uploadDir}`);
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the absolute path
  },
  filename: function (req, file, cb) {
    // Create unique filename: fieldname-timestamp.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed image extensions
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed video extensions
  const videoTypes = /mp4|mov|avi|wmv|mkv/;
  
  // Check extension
  const extname = path.extname(file.originalname).toLowerCase().substring(1);
  // Check mime type
  const mimetype = file.mimetype;

  const isImageExt = imageTypes.test(extname);
  const isVideoExt = videoTypes.test(extname);
  const isImageMime = mimetype.startsWith('image/');
  const isVideoMime = mimetype.startsWith('video/');

  if ((isImageExt && isImageMime) || (isVideoExt && isVideoMime)) {
    return cb(null, true);
  } else {
    // Provide a more specific error message
    cb(new Error(`Unsupported file type: ${mimetype} / ${extname}. Please upload images or videos.`)); 
  }
}

// Init upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // Increase limit further for videos (e.g., 200MB)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}); // Use .single('imageFieldName') for single file, .array('imagesFieldName', maxCount) for multiple

module.exports = upload;
