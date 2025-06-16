// server/server.js
require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // We'll create this next
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const tagRoutes = require("./routes/tagRoutes"); // <--
const uploadRoutes = require("./routes/uploadRoutes"); //
const adminRoutes = require("./routes/adminRoutes"); //

// Connect to Database
connectDB();

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // To parse JSON request bodies
app.use("/uploads", express.static("uploads")); // Serve uploaded files statically (we'll create 'uploads' folder later)

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/tags", tagRoutes); // <-- Mount tag routes
app.use("/api/upload", uploadRoutes); // Mount upload routes
app.use("/api/admin", adminRoutes); // Mount admin routes

app.get("/", (req, res) => {
  res.send("Golimandu API Running!");
});

app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
