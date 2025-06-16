const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getRecentActivity,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware"); // Assuming you have auth middleware

// Define admin routes
router.get("/summary", protect, admin, getDashboardSummary);
router.get("/recent-activity", protect, admin, getRecentActivity);

module.exports = router;
