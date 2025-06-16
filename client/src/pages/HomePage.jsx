// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  MapIcon,
  StarIcon,
  UsersIcon,
  CameraIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/Common/Button";
import Card from "../components/Common/Card";
import Badge from "../components/Common/Badge";
import api from "../services/api";

const features = [
  {
    name: "Discover Scenic Routes",
    description:
      "Find beautiful and safe routes tailored for adventure enthusiasts.",
    icon: <MapIcon className="h-6 w-6" />,
  },
  {
    name: "Connect with Riders",
    description:
      "Join a community of passionate travelers sharing their experiences.",
    icon: <UsersIcon className="h-6 w-6" />,
  },
  {
    name: "Capture Memories",
    description: "Document your journey with photos, videos, and stories.",
    icon: <CameraIcon className="h-6 w-6" />,
  },
  {
    name: "Personalized Recommendations",
    description:
      "Get recommendations based on your preferences and experience level.",
    icon: <StarIcon className="h-6 w-6" />,
  },
];

const HomePage = () => {
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedTrips = async () => {
      try {
        const response = await api.get("/trips?limit=3");
        if (response.data && Array.isArray(response.data)) {
          setFeaturedTrips(response.data);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching featured trips:", err);
        setError("Failed to load featured trips. Please try again later.");
        // Set some default trips if the API fails
        setFeaturedTrips([
          {
            _id: "1",
            title: "Coastal Pacific Trail",
            description:
              "Breathtaking views of the Pacific coastline with moderate difficulty.",
            image:
              "https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            duration: "5 days",
            distance: "320 km",
            difficulty: "Moderate",
            terrain: "Coastal, Hilly",
            bestSeason: "Spring, Summer",
            startLocation: "San Francisco",
            endLocation: "Los Angeles",
          },
          {
            _id: "2",
            title: "Mountain Explorer Circuit",
            description:
              "Challenging climbs with rewarding mountain views and descents.",
            image:
              "https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            duration: "7 days",
            distance: "450 km",
            difficulty: "Hard",
            terrain: "Mountain, Forest",
            bestSeason: "Summer, Fall",
            startLocation: "Denver",
            endLocation: "Salt Lake City",
          },
          {
            _id: "3",
            title: "Urban Discovery Route",
            description:
              "Cultural exploration through historic cities and urban landscapes.",
            image:
              "https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            duration: "3 days",
            distance: "150 km",
            difficulty: "Easy",
            terrain: "Urban, Paved",
            bestSeason: "All Year",
            startLocation: "Boston",
            endLocation: "New York",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTrips();
  }, []);

  return (
    <div className="bg-[var(--color-bg-light)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Enhanced Background Patterns with Animation */}
        <div className="absolute inset-0 z-0 opacity-15">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-secondary)] blur-3xl animate-pulse"></div>
          <div
            className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-[var(--color-primary)] blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-12 right-1/4 w-48 h-48 rounded-full bg-[var(--color-accent)] blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 animate-fade-in">
              {/* Custom badge styling to ensure contrast with sky blue colors */}
              <span className="inline-flex items-center font-medium text-sm px-3 py-1 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-md">
                Your Adventure Awaits
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] animate-slide-up drop-shadow-lg">
              Discover the Joy of Adventure Trips
            </h1>

            <p
              className="text-lg md:text-xl text-gray-800 mb-10 max-w-2xl mx-auto animate-slide-up font-medium"
              style={{ animationDelay: "100ms" }}
            >
              Plan, organize, and share unforgettable journeys. Connect with
              fellow adventurers, find hidden gems, and create memories that
              last a lifetime.
            </p>

            <div
              className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <Button
                size="large"
                icon={<ArrowRightIcon className="h-5 w-5" />}
                className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/trips">Explore Trips</Link>
              </Button>

              <Button
                variant="secondary"
                size="large"
                className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/plan-my-trip">Plan Your Journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title inline-block relative text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-900">
                Everything You Need for Your{" "}
                <span className="text-[var(--color-primary)]">Journey</span>
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full"></div>
            </h2>
            <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto">
              Golimandu provides all the tools to make your adventures seamless
              and memorable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                hover
                className="text-center transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-sky-50 shadow-md hover:shadow-xl border border-gray-100 hover:border-sky-100 overflow-hidden"
              >
                <div
                  className="flex flex-col items-center animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-4 mb-5 text-white bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transform transition-transform duration-500 hover:scale-110 shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section className="py-20 bg-gradient-to-b from-[var(--color-bg-light)] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title inline-block relative text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-900">
                Featured{" "}
                <span className="text-[var(--color-primary)]">Trips</span>
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full"></div>
            </h2>
            <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto">
              Explore some of our most popular routes and adventures.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured trips...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100 p-6">
              <p className="text-[var(--color-error)] font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTrips.map((trip, index) => {
                // Correctly construct the image URL
                const serverBaseUrl =
                  import.meta.env.VITE_API_URL || "http://localhost:5001";
                let imageUrl;

                if (trip.images && trip.images.length > 0) {
                  const imagePath = trip.images[0];
                  // Check if imagePath already starts with http (absolute URL)
                  if (imagePath.startsWith("http")) {
                    imageUrl = imagePath;
                  } else {
                    // Prepend server base URL if it's a relative path
                    imageUrl = `${serverBaseUrl}${
                      imagePath.startsWith("/") ? "" : "/"
                    }${imagePath}`;
                  }
                } else if (trip.image) {
                  const imagePath = trip.image;
                  if (imagePath.startsWith("http")) {
                    imageUrl = imagePath;
                  } else {
                    imageUrl = `${serverBaseUrl}${
                      imagePath.startsWith("/") ? "" : "/"
                    }${imagePath}`;
                  }
                } else {
                  imageUrl = "/placeholder-image.jpg"; // Default placeholder if no image
                }

                // Define difficulty color
                const difficultyColor =
                  {
                    Easy: "bg-green-100 text-green-800",
                    Moderate: "bg-yellow-100 text-yellow-800",
                    Hard: "bg-red-100 text-red-800",
                  }[trip.difficulty] || "bg-gray-100 text-gray-800";

                return (
                  <Card
                    key={trip._id}
                    hover
                    padding="none"
                    className="overflow-hidden group animate-slide-up shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 bg-white"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={trip.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          // Keep the existing robust error handling
                          const placeholderUrl = "/placeholder-image.jpg";
                          if (e.target.src !== placeholderUrl) {
                            console.warn(
                              `Failed to load image: ${e.target.src}, falling back to placeholder.`
                            );
                            e.target.onerror = null; // Prevent infinite loops if placeholder also fails
                            e.target.src = placeholderUrl;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Difficulty badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center font-medium text-xs px-2.5 py-0.5 rounded-full shadow-sm ${difficultyColor}`}
                        >
                          {trip.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--color-primary)] transition-colors text-gray-800">
                        {trip.title}
                      </h3>
                      <p className="text-gray-600 mb-5">{trip.description}</p>

                      {/* Trip details */}
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-5">
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-1.5 text-sky-500" />
                          <span>
                            {trip.duration || trip.durationDays + " days"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapIcon className="h-4 w-4 mr-1.5 text-sky-500" />
                          <span>{trip.distance}</span>
                        </div>
                        {trip.terrain && (
                          <div className="flex items-center text-sm text-gray-600">
                            <TagIcon className="h-4 w-4 mr-1.5 text-sky-500" />
                            <span>{trip.terrain}</span>
                          </div>
                        )}
                        {trip.bestSeason && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-1.5 text-sky-500" />
                            <span>{trip.bestSeason}</span>
                          </div>
                        )}
                      </div>

                      {/* Trip route */}
                      {(trip.startLocation || trip.endLocation) && (
                        <div className="flex items-center mb-5 text-sm">
                          <MapPinIcon className="h-4 w-4 mr-1.5 text-sky-500 flex-shrink-0" />
                          <div className="flex items-center">
                            <span className="text-gray-800 font-medium">
                              {trip.startLocation || "Starting Point"}
                            </span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="text-gray-800 font-medium">
                              {trip.endLocation || "Destination"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-3">
                          {/* Custom badge styling with sky blue colors */}
                          <span className="inline-flex items-center font-medium text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 shadow-sm">
                            {trip.maxParticipants
                              ? `${trip.maxParticipants} spots`
                              : "Open spots"}
                          </span>
                          <span className="inline-flex items-center font-medium text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 shadow-sm">
                            {trip.tripType || "Adventure"}
                          </span>
                        </div>
                        <Link
                          to={`/trips/${trip._id}`}
                          className="text-sky-500 font-semibold hover:underline flex items-center group-hover:text-sky-600 transition-all duration-300"
                        >
                          Details
                          <ChevronRightIcon className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-14">
            <Button
              variant="outline"
              className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 px-8 py-3"
            >
              <Link to="/trips" className="flex items-center">
                View All Rides
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] relative overflow-hidden">
        {/* Background pattern for CTA */}
        <div className="absolute inset-0 z-0 opacity-15">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-white/20 transform -skew-y-3"></div>
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-slide-up drop-shadow-md">
              Ready to Begin Your Adventure?
            </h2>
            <p
              className="text-lg md:text-xl mb-10 animate-slide-up font-medium text-white"
              style={{ animationDelay: "100ms" }}
            >
              Join our community of passionate adventurers and start planning
              your next journey today.
            </p>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <Button
                variant="white"
                size="large"
                className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold"
              >
                <Link to="/signup">Create Your Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
