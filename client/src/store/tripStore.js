import { create } from "zustand";
import { persist } from "zustand/middleware";

// Sample mock trips for testing when API fails
const mockTrips = [
  {
    _id: "trip1",
    title: "Coastal Pacific Trail",
    description:
      "Breathtaking views of the Pacific coastline with moderate difficulty.",
    location: "Pacific Coast",
    image:
      "https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "5 days",
    durationDays: 5,
    distance: "320 km",
    price: 499,
    difficulty: "Moderate",
    tags: ["Coastal", "Scenic", "Moderate"],
    itinerary: [
      {
        day: 1,
        location: "Starting Point",
        activities: ["Equipment check", "Route planning", "Meet and greet"],
        lodging: "Ocean View Hotel",
        notes: "Bring appropriate weather gear",
      },
      {
        day: 2,
        location: "Coastal Cliffs",
        activities: ["Cliff riding", "Photography", "Picnic lunch"],
        lodging: "Cliffside Cabins",
        notes: "Challenging elevation changes",
      },
    ],
  },
  {
    _id: "trip2",
    title: "Mountain Explorer Circuit",
    description:
      "Challenging climbs with rewarding mountain views and descents.",
    location: "Mountain Ranges",
    image:
      "https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "7 days",
    durationDays: 7,
    distance: "450 km",
    price: 799,
    difficulty: "Hard",
    tags: ["Mountain", "Challenging", "Adventure"],
    itinerary: [
      {
        day: 1,
        location: "Base Camp",
        activities: ["Orientation", "Gear check", "Planning"],
        lodging: "Mountain Lodge",
        notes: "High altitude preparation",
      },
    ],
  },
  {
    _id: "trip3",
    title: "Urban Discovery Route",
    description:
      "Cultural exploration through historic cities and urban landscapes.",
    location: "City Tour",
    image:
      "https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "3 days",
    durationDays: 3,
    distance: "150 km",
    price: 299,
    difficulty: "Easy",
    tags: ["Urban", "Cultural", "Easy"],
    itinerary: [
      {
        day: 1,
        location: "City Center",
        activities: ["Historical tour", "Local cuisine", "City park ride"],
        lodging: "Downtown Hotel",
        notes: "Light traffic in mornings",
      },
    ],
  },
];

const createTripStore = () => {
  return create(
    persist(
      (set, get) => ({
        trips: [],
        selectedTrip: null,
        error: null,
        loading: false,
        mockMode: false, // Flag to use mock data when API fails

        // Set mock mode for testing without API
        setMockMode: (useMock) => set({ mockMode: useMock }),

        // Load trips from API or use mock data
        loadTrips: async (tripsData) => {
          set({ trips: tripsData, loading: false, error: null });
        },

        // Set the selected trip
        setSelectedTrip: (trip) => {
          set({ selectedTrip: trip });
        },

        // Get trip by ID - allows fallback to mock data if needed
        getTripById: (id) => {
          const { trips, mockMode } = get();

          // First try from loaded trips
          let trip = trips.find((t) => t._id === id);

          // If not found and mock mode is enabled, check mock data
          if (!trip && mockMode) {
            trip = mockTrips.find((t) => t._id === id);
          }

          return trip;
        },

        // Use mock data as fallback
        useMockData: () => {
          set({
            trips: mockTrips,
            loading: false,
            error: null,
            mockMode: true,
          });
        },

        // Reset the store
        resetStore: () => {
          set({
            trips: [],
            selectedTrip: null,
            error: null,
            loading: false,
            mockMode: false,
          });
        },
      }),
      {
        name: "trip-store", // Storage key
        partialize: (state) => ({
          trips: state.trips,
          mockMode: state.mockMode,
        }),
      }
    )
  );
};

export const useTripStore = createTripStore();
