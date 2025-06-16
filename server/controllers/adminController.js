// server/controllers/adminController.js
const Trip = require("../models/Trip");
const User = require("../models/User");
const Booking = require("../models/Booking"); // Assuming you have a Booking model
const asyncHandler = require("express-async-handler");

// @desc    Get dashboard summary statistics
// @route   GET /api/admin/summary
// @access  Private/Admin
const getDashboardSummary = asyncHandler(async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments({});
    const totalUsers = await User.countDocuments({}); // Consider filtering non-admin users if needed
    const totalBookings = await Booking.countDocuments({});

    // Calculate bookings for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Day 0 of next month gets last day of current month
    endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

    const recentBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    res.json({
      totalTrips,
      totalUsers,
      totalBookings,
      recentBookings, // Now reflects current month's bookings
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ message: "Server Error fetching summary" });
  }
});

// @desc    Get recent activity feed
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    // Fetch recent users and bookings, sort by creation date, limit results
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("username createdAt"); // Select relevant fields

    const recentBookings = await Booking.find({})
      .populate("tripId", "title") // Populate trip title
      .populate("userId", "username") // Populate username
      .sort({ createdAt: -1 })
      .limit(3)
      .select("userId tripId createdAt"); // Select relevant fields

    // Combine and format activities
    const activities = [
      ...recentUsers.map((user) => ({
        type: "newUser",
        message: `${user.username || "A user"} registered.`,
        timestamp: user.createdAt,
        id: `user-${user._id}`,
      })),
      ...recentBookings.map((booking) => ({
        type: "newBooking",
        message: `${booking.userId?.username || "A user"} booked "${
          booking.tripId?.title || "a trip"
        }".`,
        timestamp: booking.createdAt,
        id: `booking-${booking._id}`,
      })),
    ];

    // Sort combined activities by timestamp (most recent first) and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5); // Limit to 5 most recent activities overall

    res.json(sortedActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Server Error fetching recent activity" });
  }
});

module.exports = {
  getDashboardSummary,
  getRecentActivity,
};
