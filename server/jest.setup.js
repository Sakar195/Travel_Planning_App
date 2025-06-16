const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables from .env.test file
// Adjust the path if your test env file has a different name or location
dotenv.config({ path: "./.env.test" });

// Load base .env file as well, allowing .env.test to override
dotenv.config({ path: "./.env" });

// Increase Jest's default timeout for async operations (like DB connection)
jest.setTimeout(30000); // 30 seconds

// Global setup: Connect to MongoDB before all tests
beforeAll(async () => {
  const testDbUri =
    process.env.MONGO_URI_TEST ||
    "mongodb://localhost:27017/golimandu_test_global";
  if (mongoose.connection.readyState === 0) {
    try {
      console.log(`Attempting global test DB connection to: ${testDbUri}`);
      await mongoose.connect(testDbUri, {
        serverSelectionTimeoutMS: 15000, // Increase server selection timeout
        socketTimeoutMS: 45000, // Increase socket timeout
      });
      console.log("Global Test DB Connected Successfully");
    } catch (err) {
      console.error("Global Test DB Connection Error:", err);
      process.exit(1); // Exit if DB connection fails
    }
  }
});

// Global teardown: Disconnect from MongoDB after all tests
afterAll(async () => {
  try {
    // Optional: Drop database after tests if desired
    // await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log("Global Test DB Connection Closed");
  } catch (err) {
    console.error("Error closing global test DB connection:", err);
  }
});

// You can add other global setup tasks here if needed
// For example, setting a default timeout for async operations:
// jest.setTimeout(10000); // 10 seconds
