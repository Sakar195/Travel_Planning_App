// server/utils/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Import UUID generator for transactionId

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/db");

// Load models
const User = require("../models/User");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const Image = require("../models/Image");
const Tag = require("../models/Tag");

// --- User Data Definitions ---
const usersToSeed = [
  {
    firstName: "Admin",
    lastName: "User",
    username: "adminuser",
    email: "admin@golimandu.test",
    plainPassword: "1234",
    role: "admin",
  },
  {
    firstName: "Regular",
    lastName: "User",
    username: "testuser",
    email: "user@golimandu.test",
    plainPassword: "1234",
    role: "user",
  },
];

// --- Tag Data Definitions ---
const tagsToSeed = [
  { name: "sunrise", description: "Trips focused on viewing the sunrise." },
  {
    name: "short-ride",
    description: "Suitable for quick excursions, typically less than a day.",
  },
  {
    name: "beginner-friendly",
    description: "Easier routes suitable for new riders.",
  },
  { name: "multi-day", description: "Tours spanning multiple days." },
  {
    name: "adventure",
    description: "More challenging rides, potentially off-road or remote.",
  },
  {
    name: "cultural",
    description: "Trips with a focus on local culture and heritage sites.",
  },
  {
    name: "challenging",
    description: "Difficult terrain, requires experienced riders.",
  },
  { name: "himalayan", description: "Rides in the Himalayan mountain range." },
  { name: "day-trip", description: "Completed within a single day." },
  { name: "relaxed", description: "Leisurely pace, less demanding routes." },
  {
    name: "scenic",
    description: "Routes chosen for their beautiful landscapes.",
  },
  { name: "off-road", description: "Primarily on unpaved roads or trails." },
  {
    name: "high-altitude",
    description: "Trips reaching significant altitudes.",
  },
  {
    name: "remote",
    description: "Journeys into less populated or accessible areas.",
  },
];

// --- Sample Trip Data ---
const sampleTrips = (adminUserId) => [
  {
    title: "Nagarkot Sunrise Ride",
    description:
      "An exhilarating early morning ride to witness the stunning sunrise over the Himalayas from Nagarkot. Includes breakfast.",
    location: {
      name: "Nagarkot, Bhaktapur District, Nepal",
      coordinates: [85.516, 27.717], // Approx. coordinates for Nagarkot
    },
    pricePerPerson: 3500,
    creatorId: adminUserId,
    itinerary: [
      {
        day: 1,
        location: {
          name: "Bhaktapur to Nagarkot",
          coordinates: [85.48, 27.694], // Approx. route centroid/area
        },
        activities: ["Sunrise viewing", "Breakfast at Mountain View Resort"],
        lodging: "N/A (Day trip)",
        notes: "Bring warm clothes, temperatures can be chilly in the morning",
      },
    ],
    route: [
      {
        lat: 27.671,
        lng: 85.429,
        name: "Bhaktapur Durbar Square",
        description: "Meeting point",
      },
      {
        lat: 27.7174,
        lng: 85.5165,
        name: "Nagarkot View Tower",
        description: "Sunrise viewing point",
      },
    ],
    meetUpPoint: {
      name: "Bhaktapur Durbar Square Entrance",
      coordinates: [85.4288, 27.6719],
    },
    durationDays: 1,
    startDate: new Date("2024-09-15T05:00:00Z"),
    images: ["/uploads/nagarkot.png"],
    tags: ["sunrise", "short-ride", "beginner-friendly", "scenic"],
    maxParticipants: 15,
    distance: 25,
    difficulty: "Easy",
    transportType: "Bicycle",
    isPublic: true, // Make this trip public
    isBookable: true, // Make this trip bookable
  },
  {
    title: "Mustang Valley Adventure",
    description:
      "A multi-day challenging ride through the rugged terrain of Upper Mustang. Experience Tibetan culture and breathtaking landscapes.",
    location: {
      name: "Upper Mustang, Mustang District, Nepal",
      coordinates: [83.95, 29.18], // Approx. coordinates for Lo Manthang area
    },
    pricePerPerson: 150000,
    creatorId: adminUserId,
    itinerary: [
      {
        day: 1,
        location: {
          name: "Jomsom to Kagbeni",
          coordinates: [83.75, 28.8], // Approx. between Jomsom/Kagbeni
        },
        activities: [
          "Morning flight to Jomsom",
          "Ride to Kagbeni",
          "Evening exploration of old town",
        ],
        lodging: "Red House Lodge, Kagbeni",
        notes: "Altitude adjustment day, drink plenty of water",
      },
      {
        day: 2,
        location: {
          name: "Kagbeni to Ghami",
          coordinates: [83.83, 28.95], // Approx. between Kagbeni/Ghami
        },
        activities: [
          "Visit Chuksang village",
          "Cross Gyu La pass (4,077m)",
          "Picnic lunch with valley views",
        ],
        lodging: "Ghami Guest House",
        notes: "Challenging riding day, prepare for altitude",
      },
      {
        day: 3,
        location: {
          name: "Ghami to Lo Manthang",
          coordinates: [83.91, 29.13], // Approx. between Ghami/Lo Manthang
        },
        activities: [
          "Visit ancient Ghar Gompa",
          "Cross Nyi La pass (4,020m)",
          "Afternoon arrival at Lo Manthang",
        ],
        lodging: "Mystique Lo Manthang Resort",
        notes: "First views of the walled city",
      },
      {
        day: 4,
        location: {
          name: "Lo Manthang",
          coordinates: [83.9556, 29.1897], // Approx. coordinates for Lo Manthang
        },
        activities: [
          "Explore Walled City",
          "Visit Choedhe Monastery",
          "Cultural performance evening",
        ],
        lodging: "Mystique Lo Manthang Resort",
        notes: "Rest day for bikes, mostly walking",
      },
      {
        day: 5,
        location: {
          name: "Lo Manthang to Syangboche",
          coordinates: [83.81, 28.98], // Approx. coords for Syangboche
        },
        activities: [
          "Visit Garphu and Nyphu Caves",
          "Cross Lo La Pass",
          "Visit Dhakmar (red cliffs)",
        ],
        lodging: "Syangboche Guest House",
        notes: "Long riding day, early start recommended",
      },
      {
        day: 6,
        location: {
          name: "Syangboche to Jomsom",
          coordinates: [83.76, 28.88], // Approx. between Syangboche/Jomsom
        },
        activities: [
          "Early breakfast",
          "Scenic ride through Muktinath",
          "Visit Muktinath Temple",
        ],
        lodging: "Om's Home, Jomsom",
        notes: "Prepare for varying weather conditions",
      },
      {
        day: 7,
        location: {
          name: "Jomsom to Pokhara",
          coordinates: [83.85, 28.5], // Approx. midpoint (flight)
        },
        activities: ["Morning flight to Pokhara", "Farewell lunch"],
        lodging: "N/A (Tour End)",
        notes: "Flights subject to weather conditions",
      },
    ],
    route: [
      {
        lat: 28.7805,
        lng: 83.7223,
        name: "Jomsom",
        description: "Starting point",
      },
      {
        lat: 28.8339,
        lng: 83.7911,
        name: "Kagbeni",
        description: "Ancient village at entry to Upper Mustang",
      },
      {
        lat: 29.0793,
        lng: 83.8706,
        name: "Ghami",
        description: "Village with beautiful barley fields",
      },
      {
        lat: 29.1897,
        lng: 83.9556,
        name: "Lo Manthang",
        description: "Walled capital city of Upper Mustang",
      },
    ],
    meetUpPoint: {
      name: "Jomsom Airport",
      coordinates: [83.7223, 28.7805], // Approx. coordinates for Jomsom Airport
    },
    durationDays: 7,
    startDate: new Date("2024-10-05T08:00:00Z"),
    images: ["/uploads/mustang.png"],
    tags: [
      "multi-day",
      "adventure",
      "cultural",
      "challenging",
      "himalayan",
      "high-altitude",
      "remote",
    ],
    maxParticipants: 8,
    distance: 380,
    difficulty: "Difficult",
    transportType: "Motorcycle",
    isPublic: false,
    isBookable: false,
  },
  {
    title: "Pokhara Lakeside Loop",
    description:
      "A relaxed day ride around the beautiful Phewa Lake in Pokhara, visiting Davis Falls and Gupteshwor Cave.",
    location: {
      name: "Pokhara Lakeside, Kaski District, Nepal",
      coordinates: [83.96, 28.21], // Approx. coordinates for Pokhara Lakeside
    },
    pricePerPerson: 6000,
    creatorId: adminUserId,
    itinerary: [
      {
        day: 1,
        location: {
          name: "Pokhara Lakeside Area",
          coordinates: [83.955, 28.2], // Approx. coordinates for Lakeside area
        },
        activities: [
          "Morning ride around north shore",
          "Visit Davis Falls & Gupteshwor Cave",
          "Lunch at lakeside restaurant",
          "Afternoon boat ride (optional)",
        ],
        lodging: "N/A (Day trip)",
        notes: "Easy riding, suitable for beginners",
      },
    ],
    route: [
      {
        lat: 28.207,
        lng: 83.9586,
        name: "Lakeside Center",
        description: "Starting and ending point",
      },
      {
        lat: 28.1901,
        lng: 83.9509,
        name: "Davis Falls",
        description: "Famous waterfall",
      },
      {
        lat: 28.1897,
        lng: 83.9506,
        name: "Gupteshwor Cave",
        description: "Sacred cave with Shiva shrine",
      },
    ],
    meetUpPoint: {
      name: "Lakeside Center, Pokhara",
      coordinates: [83.9586, 28.207], // Approx. coordinates for Lakeside Center
    },
    durationDays: 1,
    startDate: new Date("2024-09-22T09:00:00Z"),
    images: ["/uploads/pokhara.png"],
    tags: ["day-trip", "relaxed", "scenic", "beginner-friendly"],
    maxParticipants: 20,
    distance: 15,
    difficulty: "Easy",
    transportType: "Mixed",
    isPublic: true, // Make this trip public
    isBookable: true, // Make this trip bookable
  },
];

// Sample media entries
const createMediaSamples = (adminUserId, regularUserId, tripIds) => [
  {
    userId: adminUserId,
    rideId: tripIds[0],
    mediaType: "Photo",
    mediaUrl: "/uploads/sample-user-nagarkot1.jpg",
    description: "Beautiful sunrise from Nagarkot viewpoint",
  },
  {
    userId: adminUserId,
    rideId: tripIds[1],
    mediaType: "Photo",
    mediaUrl: "/uploads/sample-user-mustang1.jpg",
    description: "The walled city of Lo Manthang",
  },
  {
    userId: regularUserId,
    rideId: tripIds[2],
    mediaType: "Photo",
    mediaUrl: "/uploads/sample-user-pokhara1.jpg",
    description: "Peaceful morning at Phewa Lake",
  },
  {
    userId: regularUserId,
    mediaType: "Video",
    mediaUrl: "/uploads/sample-user-video1.mp4",
    description: "Riding through the countryside",
  },
];

// --- Main Seeding Function ---
const runSeeder = async (destroy = false) => {
  let connection;
  try {
    connection = await connectDB();
    console.log("[Seeder] MongoDB Connected for Seeder...");

    if (destroy) {
      console.log("[Seeder] Attempting to destroy data...");
      await Image.deleteMany();
      await Booking.deleteMany();
      await Trip.deleteMany();
      await Tag.deleteMany();
      await User.deleteMany();
      console.log("[Seeder] Data Destroyed Successfully!");
    } else {
      console.log("[Seeder] Attempting to import data...");
      // Clear existing data first
      await User.deleteMany();
      console.log("[Seeder] Existing Users cleared...");
      await Trip.deleteMany();
      console.log("[Seeder] Existing Trips cleared...");
      await Booking.deleteMany();
      console.log("[Seeder] Existing Bookings cleared...");
      await Image.deleteMany();
      console.log("[Seeder] Existing Media cleared...");
      await Tag.deleteMany();
      console.log("[Seeder] Existing Tags cleared...");

      // --- Seed Tags ---
      console.log("[Seeder] Seeding Tags...");
      await Tag.insertMany(tagsToSeed);
      console.log(`[Seeder] ${tagsToSeed.length} Tags seeded successfully.`);

      // --- Create Users ---
      console.log("[Seeder] Creating users...");
      const createdUsers = [];

      for (const user of usersToSeed) {
        console.log(`[Seeder] Processing user ${user.username}...`);

        const newUser = await User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          password: user.plainPassword,
          role: user.role,
        });

        createdUsers.push(newUser);
        console.log(
          `[Seeder] User ${user.username} created with ID: ${newUser._id}`
        );
      }

      console.log(
        `[Seeder] ${createdUsers.length} users created successfully.`
      );

      const adminUser = createdUsers.find((u) => u.role === "admin");
      const regularUser = createdUsers.find((u) => u.role === "user");

      if (!adminUser || !adminUser._id) {
        throw new Error(
          "[Seeder] Failed to find created admin user or retrieve _id."
        );
      }
      if (!regularUser || !regularUser._id) {
        throw new Error(
          "[Seeder] Failed to find created regular user or retrieve _id."
        );
      }
      const adminUserId = adminUser._id;
      const regularUserId = regularUser._id;
      console.log(`[Seeder] Admin user ID found: ${adminUserId}`);
      console.log(`[Seeder] Regular user ID found: ${regularUserId}`);

      // --- Create Sample Trips using Admin ID ---
      let createdTrips = [];
      if (adminUserId) {
        console.log(
          `[Seeder] Preparing sample trips with adminId: ${adminUserId}...`
        );
        const tripsToCreate = sampleTrips(adminUserId);

        // Create trips one by one
        // rideId will be auto-generated by the Trip model schema default
        for (const tripData of tripsToCreate) {
          const trip = await Trip.create(tripData);
          createdTrips.push(trip);
          console.log(
            `[Seeder] Created trip: ${trip.title} with ID: ${trip._id}`
          );
        }

        console.log(
          `[Seeder] ${createdTrips.length} sample trips created successfully.`
        );
      } else {
        console.warn(
          "[Seeder] Admin user ID not found, skipping trip creation."
        );
      }

      // --- Create Sample Bookings --- UPDATED LOGIC ---
      if (regularUserId && createdTrips.length > 0) {
        console.log(`[Seeder] Creating sample bookings...`);

        // Booking 1: Confirmed booking for the first trip
        const trip1 = createdTrips[0];
        if (trip1 && trip1.pricePerPerson !== undefined) {
          const numberOfPersons1 = 1;
          const totalAmount1 = trip1.pricePerPerson * numberOfPersons1;
          const transactionId1 = `SEED-${uuidv4()}`;
          const booking1Data = {
            userId: regularUserId,
            tripId: trip1._id, // Use tripId
            numberOfPersons: numberOfPersons1,
            totalAmount: totalAmount1,
            transactionId: transactionId1,
            paymentMethod: "esewa", // Example payment method
            paymentStatus: "succeeded", // Match status
            paymentGatewayRef: `seed-ref-${transactionId1.substring(0, 8)}`, // Example ref
            status: "confirmed",
          };
          const booking1 = await Booking.create(booking1Data);
          console.log(
            `[Seeder] Created CONFIRMED booking ${booking1._id} for trip ${trip1.title}`
          );
        } else {
          console.warn(
            `[Seeder] Skipping booking 1 creation: Trip 1 or pricePerPerson missing.`
          );
        }

        // Booking 2: Pending booking for the second trip
        if (createdTrips.length > 1) {
          const trip2 = createdTrips[1];
          if (trip2 && trip2.pricePerPerson !== undefined) {
            const numberOfPersons2 = 2;
            const totalAmount2 = trip2.pricePerPerson * numberOfPersons2;
            const transactionId2 = `SEED-${uuidv4()}`;
            const booking2Data = {
              userId: regularUserId,
              tripId: trip2._id, // Use tripId
              numberOfPersons: numberOfPersons2,
              totalAmount: totalAmount2,
              transactionId: transactionId2,
              paymentMethod: "khalti", // Example payment method
              paymentStatus: "pending", // Match status
              status: "pending",
              // No paymentGatewayRef for pending
            };
            const booking2 = await Booking.create(booking2Data);
            console.log(
              `[Seeder] Created PENDING booking ${booking2._id} for trip ${trip2.title}`
            );
          } else {
            console.warn(
              `[Seeder] Skipping booking 2 creation: Trip 2 or pricePerPerson missing.`
            );
          }
        }

        // Booking 3: Cancelled booking for the third trip
        if (createdTrips.length > 2) {
          const trip3 = createdTrips[2];
          if (trip3 && trip3.pricePerPerson !== undefined) {
            const numberOfPersons3 = 1;
            const totalAmount3 = trip3.pricePerPerson * numberOfPersons3;
            const transactionId3 = `SEED-${uuidv4()}`;
            const booking3Data = {
              userId: regularUserId,
              tripId: trip3._id, // Use tripId
              numberOfPersons: numberOfPersons3,
              totalAmount: totalAmount3,
              transactionId: transactionId3,
              paymentMethod: "esewa", // Example payment method
              paymentStatus: "pending", // Payment might have been initiated or not before cancelling
              status: "cancelled",
              // No paymentGatewayRef
            };
            const booking3 = await Booking.create(booking3Data);
            console.log(
              `[Seeder] Created CANCELLED booking ${booking3._id} for trip ${trip3.title}`
            );
          } else {
            console.warn(
              `[Seeder] Skipping booking 3 creation: Trip 3 or pricePerPerson missing.`
            );
          }
        }

        console.log(`[Seeder] Sample bookings created.`);
      } else {
        console.warn(
          "[Seeder] Skipping sample booking creation (no user or trips)."
        );
      }
      // --- END OF UPDATED BOOKING LOGIC ---

      // --- Create Sample Media Entries ---
      if (adminUserId && regularUserId && createdTrips.length > 0) {
        console.log(`[Seeder] Creating sample media entries...`);
        const tripIds = createdTrips.map((trip) => trip._id);
        const mediaEntries = createMediaSamples(
          adminUserId,
          regularUserId,
          tripIds
        );

        // Create media entries one by one
        // mediaId will be auto-generated by the Image model pre-save hook
        for (const mediaData of mediaEntries) {
          // Remove manual mediaId
          const media = await Image.create(mediaData);
          console.log(`[Seeder] Created media with ID: ${media._id}`);
        }

        console.log(
          `[Seeder] ${mediaEntries.length} sample media entries created.`
        );
      } else {
        console.warn(
          "[Seeder] Skipping sample media creation (missing required IDs)."
        );
      }

      console.log("[Seeder] Data Imported Successfully!");
    }
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error("\n--- Seeder Error ---");
    console.error(error.message);
    if (error.errors) {
      if (error.code === 11000 && error.message.includes("tags")) {
        console.warn(
          "[Seeder] Warning: Attempted to insert duplicate tags. This is likely okay if tags already existed."
        );
      } else {
        console.error("Validation Errors:", error.errors);
      }
    }
    console.error("--------------------\n");
    process.exit(1); // Exit with failure
  } finally {
    // Ensure connection is closed
    if (connection) {
      await mongoose.connection.close();
      console.log("[Seeder] MongoDB Connection Closed.");
    }
  }
};

// --- Script Execution Logic ---
if (process.argv[2] === "-d") {
  runSeeder(true);
} else {
  runSeeder(false);
}
