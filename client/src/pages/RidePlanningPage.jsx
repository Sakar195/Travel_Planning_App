// src/pages/RidePlanningPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MapPinIcon,
  CalendarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import { createTrip, uploadImages } from "../services/tripService";
import { getAllTags } from "../services/tagService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import Select from "react-select";
import InteractiveMap from "../components/Common/InteractiveMap";

const ItineraryDay = ({ dayIndex, dayData, onDataChange, onRemove }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for comma-separated activities
    const finalValue =
      name === "activities"
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : value;
    onDataChange(dayIndex, name, finalValue);
  };

  return (
    <Card
      className="mb-4 border border-[var(--color-border)] animate-slide-up hover:shadow-[var(--shadow-md)] transition-all duration-300"
      style={{ animationDelay: `${dayIndex * 100}ms` }}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-[var(--color-txt-primary)] flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
          Day {dayData.day}
        </h4>
        <Button
          variant="danger-outline"
          size="small"
          onClick={() => onRemove(dayIndex)}
          icon={<TrashIcon className="h-4 w-4" />}
        >
          Remove Day
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`location-${dayIndex}`}
            className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
          >
            Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-[var(--color-txt-tertiary)]" />
            </div>
            <input
              type="text"
              id={`location-${dayIndex}`}
              name="location"
              value={dayData.location}
              onChange={handleInputChange}
              placeholder="e.g., Pokhara"
              className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`activities-${dayIndex}`}
            className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
          >
            Activities (comma-separated)
          </label>
          <input
            type="text"
            id={`activities-${dayIndex}`}
            name="activities"
            value={
              Array.isArray(dayData.activities)
                ? dayData.activities.join(", ")
                : ""
            }
            onChange={handleInputChange}
            placeholder="e.g., Boating, Visit Peace Pagoda"
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
          />
        </div>

        <div>
          <label
            htmlFor={`lodging-${dayIndex}`}
            className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
          >
            Lodging
          </label>
          <input
            type="text"
            id={`lodging-${dayIndex}`}
            name="lodging"
            value={dayData.lodging}
            onChange={handleInputChange}
            placeholder="e.g., Lakeside Hotel"
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
          />
        </div>

        <div>
          <label
            htmlFor={`notes-${dayIndex}`}
            className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
          >
            Notes
          </label>
          <textarea
            id={`notes-${dayIndex}`}
            name="notes"
            rows="2"
            value={dayData.notes}
            onChange={handleInputChange}
            placeholder="e.g., Check weather forecast"
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
          ></textarea>
        </div>
      </div>
    </Card>
  );
};

const RidePlanningPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    durationDays: "",
    maxParticipants: 10,
    price: "",
    distance: "",
    difficulty: "Moderate",
    transportType: "Motorcycle",
    meetUpPoint: "",
    itinerary: [
      { day: 1, location: "", activities: [], lodging: "", notes: "" },
    ],
    tags: [],
    route: [],
    images: [],
  });
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  // Refs for map containers
  const createMapContainerRef = useRef(null);
  const previewMapContainerRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      const fetchedTags = await getAllTags();
      const options = fetchedTags.map((tag) => ({
        value: tag.name,
        label: tag.name,
      }));
      setTagOptions(options);
    };
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      itinerary: currentData.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      ),
    }));
  };

  const addDay = () => {
    const nextDayNumber =
      formData.itinerary.length > 0
        ? formData.itinerary[formData.itinerary.length - 1].day + 1
        : 1;
    setFormData((currentData) => ({
      ...currentData,
      itinerary: [
        ...currentData.itinerary,
        {
          day: nextDayNumber,
          location: "",
          activities: [],
          lodging: "",
          notes: "",
        },
      ],
    }));
  };

  const removeDay = (indexToRemove) => {
    if (formData.itinerary.length <= 1) {
      alert("You must have at least one day in the itinerary.");
      return;
    }
    setFormData((currentData) => ({
      ...currentData,
      itinerary: currentData.itinerary
        .filter((_, i) => i !== indexToRemove)
        .map((day, newIndex) => ({ ...day, day: newIndex + 1 })),
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: Array.from(e.target.files),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        images: [],
      }));
    }
  };

  const handleTagChange = (selectedOptions) => {
    // Limit to maximum 7 tags
    if (selectedOptions && selectedOptions.length > 7) {
      // Keep only the first 7 items
      selectedOptions = selectedOptions.slice(0, 7);
    }

    setSelectedTags(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
  };

  const handleRouteMarkersChange = (markers) => {
    console.log("Route markers updated:", markers);
    setFormData((prev) => ({
      ...prev,
      route: markers,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrls = [];
      // 1. Upload images if present
      if (formData.images && formData.images.length > 0) {
        console.log("Uploading images...");
        try {
          imageUrls = await uploadImages(formData.images);
          console.log("Images uploaded, URLs:", imageUrls);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError(
            `Failed to upload images: ${
              uploadError.message || "Server error"
            }. Please try again.`
          );
          setLoading(false);
          return; // Stop submission if image upload fails
        }
      }

      // 2. Prepare final trip data with image URLs
      const dataToSubmit = {
        ...formData,
        durationDays: parseInt(formData.durationDays) || null,
        maxParticipants: parseInt(formData.maxParticipants) || null,
        price: parseFloat(formData.price) || null,
        distance: parseFloat(formData.distance) || null,
        tags: selectedTags,
        images: imageUrls, // Use the returned URLs here
      };


      delete dataToSubmit.rideImages;

      console.log("Submitting ride plan:", dataToSubmit);

      // 3. Create the trip with the processed data
      const newTrip = await createTrip(dataToSubmit);
      console.log("Ride created:", newTrip);
      navigate(`/trips/${newTrip._id}`);
    } catch (err) {
      // Handle errors from createTrip API call
      setError(err.message || "Failed to create trip.");
      console.error("Trip creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for react-select to match theme
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "var(--color-border)",
      boxShadow: "none",
      "&:hover": {
        borderColor: "var(--color-primary)",
      },
      padding: "0.25rem",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "var(--color-primary-light)",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "var(--color-primary-dark)",
      fontWeight: 600,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "var(--color-primary)",
      "&:hover": {
        backgroundColor: "var(--color-primary)",
        color: "white",
      },
    }),
  };

  // Log map container dimensions when Maps tab is active
  useEffect(() => {
    if (activeTab === "maps") {
      setTimeout(() => {
        // Use timeout to allow DOM to update
        if (createMapContainerRef.current) {
          console.log("[RidePlanningPage] Create Map Container Dimensions:", {
            width: createMapContainerRef.current.offsetWidth,
            height: createMapContainerRef.current.offsetHeight,
          });
        }
        if (previewMapContainerRef.current) {
          console.log("[RidePlanningPage] Preview Map Container Dimensions:", {
            width: previewMapContainerRef.current.offsetWidth,
            height: previewMapContainerRef.current.offsetHeight,
          });
        }
      }, 100); // Short delay
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-txt-primary)]">
          Create Ride Plan
        </h1>
        <p className="text-[var(--color-txt-secondary)]">
          Plan your next motorcycle adventure
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Form Inputs */}
          <div className="lg:col-span-7">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

              {/* Tabs for form sections */}
              <div className="mb-6 border-b border-[var(--color-border)]">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className={`px-4 py-2 border-b-2 ${
                      activeTab === "details"
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-txt-secondary)]"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Trip Details
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 border-b-2 ${
                      activeTab === "itinerary"
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-txt-secondary)]"
                    }`}
                    onClick={() => setActiveTab("itinerary")}
                  >
                    Itinerary
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 border-b-2 ${
                      activeTab === "maps"
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-txt-secondary)]"
                    }`}
                    onClick={() => setActiveTab("maps")}
                  >
                    Maps
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 border-b-2 ${
                      activeTab === "media"
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-txt-secondary)]"
                    }`}
                    onClick={() => setActiveTab("media")}
                  >
                    Photos & Videos
                  </button>
                </div>
              </div>

              {/* Trip Details Tab Content */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Weekend Ride to Pokhara"
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief overview of the ride..."
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Pokhara"
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="durationDays"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      id="durationDays"
                      name="durationDays"
                      value={formData.durationDays}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tags"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Tags (select up to 7)
                    </label>
                    <Select
                      inputId="tags"
                      name="tags"
                      isMulti
                      options={tagOptions}
                      value={tagOptions.filter((option) =>
                        selectedTags.includes(option.value)
                      )}
                      onChange={handleTagChange}
                      placeholder="Select tags..."
                      className="w-full"
                      styles={customSelectStyles}
                      isOptionDisabled={() => selectedTags.length >= 7}
                      noOptionsMessage={() =>
                        selectedTags.length >= 7
                          ? "Maximum 7 tags allowed"
                          : "No options available"
                      }
                    />
                    {selectedTags.length >= 7 && (
                      <p className="text-sm text-amber-600 mt-1">
                        Maximum of 7 tags reached
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Itinerary Tab Content */}
              {activeTab === "itinerary" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-txt-primary)]">
                      Daily Itinerary
                    </h3>
                    <Button
                      variant="primary-outline"
                      size="small"
                      onClick={addDay}
                      icon={<PlusCircleIcon className="h-4 w-4" />}
                    >
                      Add Day
                    </Button>
                  </div>

                  {formData.itinerary.map((day, index) => (
                    <ItineraryDay
                      key={day.day}
                      dayIndex={index}
                      dayData={day}
                      onDataChange={handleItineraryChange}
                      onRemove={removeDay}
                    />
                  ))}
                </div>
              )}

              {/* NEW Maps Tab Content */}
              {activeTab === "maps" && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-txt-primary)] mb-2">
                      Plan Your Route
                    </h3>
                    <p className="text-[var(--color-txt-secondary)] text-sm mb-4">
                      Click on the map to add your starting point, destination,
                      and waypoints. The route will automatically connect these
                      points.
                    </p>

                    <div
                      ref={createMapContainerRef}
                      className="border border-[var(--color-border)] rounded-lg overflow-hidden"
                      style={{ height: "450px" }}
                    >
                      {console.log(
                        "[RidePlanningPage] Rendering Create Map with route:",
                        formData.route
                      )}
                      <InteractiveMap
                        markers={formData.route}
                        isEditable={true}
                        onMarkersChange={handleRouteMarkersChange}
                        height={450}
                        key="create-map"
                      />
                    </div>

                    <div className="mt-4 bg-sky-50 p-4 rounded-lg text-sm text-sky-800">
                      <p>
                        <strong>Route Summary:</strong>{" "}
                        {formData.route.length === 0
                          ? "No route points added yet."
                          : `${
                              formData.route.length
                            } points marked on the map (${
                              formData.route.filter((m) => m.type === "start")
                                .length
                            } start, ${
                              formData.route.filter((m) => m.type === "end")
                                .length
                            } end, ${
                              formData.route.filter(
                                (m) => m.type === "waypoint"
                              ).length
                            } waypoints)`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Photos & Videos Tab Content */}
              {activeTab === "media" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="images"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      Upload Images
                    </label>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                      multiple
                      accept="image/*"
                    />
                    <p className="text-xs text-[var(--color-txt-tertiary)] mt-1">
                      You can select multiple images. Max size: 5MB per image.
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {formData.images.map((file, index) => (
                        <div
                          key={index}
                          className="relative border border-[var(--color-border)] rounded-lg overflow-hidden h-40"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Preview/Map */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {activeTab === "maps" ? "Route Preview" : "Trip Preview"}
                </h2>

                {activeTab === "maps" ? (
                  <div
                    ref={previewMapContainerRef}
                    className="rounded-lg overflow-hidden"
                    style={{ height: "300px" }}
                  >
                    {console.log(
                      "[RidePlanningPage] Rendering Preview Map with route:",
                      formData.route
                    )}
                    <InteractiveMap
                      markers={formData.route}
                      isEditable={false}
                      height={300}
                      key="preview-map"
                    />
                  </div>
                ) : (
                  /* Existing preview content */
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-sky-900/20 dark:to-cyan-900/20 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPinIcon className="h-10 w-10 mx-auto mb-2 text-sky-500" />
                      <p className="text-sky-700 font-medium">
                        {formData.location || "Location not set"}
                      </p>
                      <p className="text-sky-600 text-sm mt-2">
                        {formData.durationDays
                          ? `${formData.durationDays} days`
                          : "Duration not set"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                    icon={
                      loading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      ) : null
                    }
                  >
                    {loading ? "Creating..." : "Create Ride Plan"}
                  </Button>

                  <p className="text-center text-[var(--color-txt-tertiary)] text-xs mt-2">
                    {formData.isPublic
                      ? "This ride will be visible to others"
                      : "This ride will be private to you"}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RidePlanningPage;
