// src/pages/Admin/RidePlanningPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MapPinIcon,
  CalendarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  TagIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Badge from "../../components/Common/Badge";
import {
  createTrip,
  uploadImages,
  getTripById,
  updateTrip,
} from "../../services/tripService";
import { getAllTags } from "../../services/tagService";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Select from "react-select";
import LocationInput from "../../components/Common/LocationInput";
import InteractiveMap from "../../components/Common/InteractiveMap";

const InteractiveMapPlaceholder = () => (
  <div className="bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-sky-900/20 dark:to-cyan-900/20 h-96 lg:h-full rounded-lg shadow-md flex items-center justify-center text-sky-600 dark:text-sky-400 overflow-hidden relative">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-sky-400 to-cyan-500 opacity-20"></div>
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className="border border-sky-200/20"></div>
        ))}
      </div>
    </div>
    <div className="z-10 text-center p-6">
      <MapPinIcon className="h-12 w-12 mx-auto mb-3 text-sky-500" />
      <p className="text-lg font-medium">Interactive Map Area</p>
      <p className="text-sm text-sky-600/70 dark:text-sky-400/70 mt-2">
        Design and visualize your route
      </p>
    </div>
  </div>
);

const ItineraryDay = ({
  dayIndex,
  dayData,
  onDataChange,
  onRemove,
  showErrors,
  dayErrors,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onDataChange(dayIndex, name, value);
  };

  const handleLocationSelect = (locationData) => {
    console.log(
      `[ItineraryDay ${dayData.day}] Location selected:`,
      locationData
    );
    onDataChange(
      dayIndex,
      "location",
      locationData || { name: "", coordinates: null }
    );
  };

  const locationError =
    dayErrors?.field === "location" ? dayErrors.message : null;

  return (
    <Card
      className={`mb-4 border ${
        locationError ? "border-red-500" : "border-[var(--color-border)]"
      } animate-slide-up hover:shadow-[var(--shadow-md)] transition-all duration-300`}
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
        <LocationInput
          id={`itinerary-location-${dayIndex}`}
          name={`itinerary-location-${dayIndex}`}
          label="Location *"
          placeholder="e.g., Pokhara Lakeside"
          initialValue={dayData.location?.name || ""}
          onLocationSelect={handleLocationSelect}
          required={true}
        />
        {locationError && showErrors && (
          <p className="text-xs text-red-600 mt-1">{locationError}</p>
        )}
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
            value={dayData.activities || ""}
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
            value={dayData.lodging || ""}
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
            value={dayData.notes || ""}
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
  const { tripId } = useParams();
  const isEditing = Boolean(tripId);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const initialFormData = {
    title: "",
    description: "",
    location: { name: "", coordinates: null },
    startDate: "",
    durationDays: "",
    maxParticipants: 10,
    pricePerPerson: "",
    distance: "",
    difficulty: "Moderate",
    transportType: "Motorcycle",
    meetUpPoint: { name: "", coordinates: null },
    itinerary: [
      {
        day: 1,
        location: { name: "", coordinates: null },
        activities: "",
        lodging: "",
        notes: "",
      },
    ],
    tags: [],
    existingImages: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [imagesToUpload, setImagesToUpload] = useState([]);

  const [stepErrors, setStepErrors] = useState({});
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const createMapContainerRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getAllTags();
        const options = fetchedTags.map((tag) => ({
          value: tag.name,
          label: tag.name,
        }));
        setTagOptions(options);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (isEditing && tripId) {
      const fetchTripData = async () => {
        setInitialLoading(true);
        setError(null);
        try {
          console.log(`Fetching trip data for ID: ${tripId}`);
          const data = await getTripById(tripId);
          console.log("Fetched data:", data);
          const formattedStartDate = data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : "";
          const validItinerary = data.itinerary?.length
            ? data.itinerary.map((day) => ({
                ...day,
                location: day.location || { name: "", coordinates: null },
                activities: Array.isArray(day.activities)
                  ? day.activities.join(", ")
                  : day.activities || "",
                lodging: day.lodging || "",
                notes: day.notes || "",
              }))
            : [initialFormData.itinerary[0]];

          setFormData({
            title: data.title || "",
            description: data.description || "",
            location: data.location || { name: "", coordinates: null },
            startDate: formattedStartDate,
            durationDays: data.durationDays || "",
            maxParticipants: data.maxParticipants || 10,
            pricePerPerson: data.pricePerPerson || "",
            distance: data.distance || "",
            difficulty: data.difficulty || "Moderate",
            transportType: data.transportType || "Motorcycle",
            meetUpPoint: data.meetUpPoint || { name: "", coordinates: null },
            itinerary: validItinerary,
            tags: data.tags || [],
            existingImages: data.images || [],
          });
          setSelectedTags(data.tags || []);
          setImagesToUpload([]);
        } catch (err) {
          console.error("Failed to fetch trip details:", err);
          setError("Failed to load trip details. Does this trip exist?");
          setFormData(initialFormData);
          setSelectedTags([]);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchTripData();
    } else {
      setFormData(initialFormData);
      setSelectedTags([]);
      setImagesToUpload([]);
      setInitialLoading(false);
    }
  }, [isEditing, tripId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocationChange = (locationData) => {
    console.log("[Admin RidePlanning] Main Location selected:", locationData);
    setFormData((prev) => ({
      ...prev,
      location: locationData || { name: "", coordinates: null },
    }));
  };

  const handleMeetupPointChange = (locationData) => {
    console.log("[Admin RidePlanning] Meetup Point selected:", locationData);
    setFormData((prev) => ({
      ...prev,
      meetUpPoint: locationData || { name: "", coordinates: null },
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    console.log(
      `[Admin RidePlanning] Itinerary Day ${index} field '${field}' changed:`,
      value
    );
    setFormData((currentData) => ({
      ...currentData,
      itinerary: currentData.itinerary.map((day, i) => {
        if (i === index) {
          return { ...day, [field]: value };
        }
        return day;
      }),
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
          location: { name: "", coordinates: null },
          activities: "",
          lodging: "",
          notes: "",
        },
      ],
    }));
  };

  const removeDay = (indexToRemove) => {
    if (formData.itinerary.length <= 1) {
      setError("You must have at least one day in the itinerary.");
      setTimeout(() => setError(null), 3000);
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
      const newFiles = Array.from(e.target.files);
      setImagesToUpload((prev) => [...prev, ...newFiles]);
      e.target.value = null;
    }
  };

  const removeNewImagePreview = (indexToRemove) => {
    setImagesToUpload((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeExistingImage = (imagePathToRemove) => {
    if (
      !window.confirm(
        "Mark this image for removal? It will be deleted when you save."
      )
    )
      return;
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter(
        (imgPath) => imgPath !== imagePathToRemove
      ),
    }));
    console.log("Image marked for removal:", imagePathToRemove);
  };

  const handleTagChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 7) {
      selectedOptions = selectedOptions.slice(0, 7);
      alert("Maximum 7 tags allowed.");
    }
    setSelectedTags(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const errors = validateStep(currentStep, formData);
    setStepErrors(errors);
    setIsCurrentStepValid(Object.keys(errors).length === 0);

    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors in all steps before saving.");
      setShowErrors(true);
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrls = [];
      if (imagesToUpload.length > 0) {
        console.log("Uploading new images...");
        try {
          uploadedImageUrls = await uploadImages(imagesToUpload);
          console.log("New images uploaded, URLs:", uploadedImageUrls);
        } catch (uploadError) {
          console.error("New image upload failed:", uploadError);
          setError(
            `Failed to upload new images: ${
              uploadError.response?.data?.message ||
              uploadError.message ||
              "Server error"
            }. Please try again.`
          );
          setLoading(false);
          return;
        }
      }

      const dataToSubmit = {
        ...formData,
        durationDays: parseInt(formData.durationDays) || null,
        maxParticipants: parseInt(formData.maxParticipants) || null,
        availableSeats: parseInt(formData.maxParticipants) || null,
        pricePerPerson: parseFloat(formData.pricePerPerson) || null,
        distance: parseFloat(formData.distance) || null,
        isPublic: true,
        isBookable: true,
        tags: selectedTags,
        images: [...formData.existingImages, ...uploadedImageUrls],
        itinerary: formData.itinerary.map((day) => ({
          day: day.day,
          location: day.location,
          activities: String(day.activities || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          lodging: day.lodging || "",
          notes: day.notes || "",
        })),
        meetUpPoint: formData.meetUpPoint,
      };

      delete dataToSubmit.existingImages;

      console.log(
        `Submitting ${isEditing ? "update" : "create"} data:`,
        dataToSubmit
      );

      if (isEditing) {
        console.log(`Updating trip ID: ${tripId}`);
        const updatedTrip = await updateTrip(tripId, dataToSubmit);
        console.log("Trip updated:", updatedTrip);
        alert("Trip updated successfully!");
        navigate("/admin/manage-trips");
      } else {
        console.log("Creating new trip");
        const newTrip = await createTrip(dataToSubmit);
        console.log("Trip created:", newTrip);
        alert("Trip created successfully!");
        navigate("/admin/manage-trips");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${isEditing ? "update" : "create"} trip.`;
      setError(errorMsg);
      console.error(
        `Trip ${isEditing ? "update" : "creation"} error:`,
        err.response || err
      );
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step, currentFormData) => {
    const errors = {};
    if (step === 1) {
      if (!currentFormData.title.trim())
        errors.title = "Trip title is required.";
      if (!currentFormData.description.trim())
        errors.description = "Description is required.";
      if (!currentFormData.location?.coordinates)
        errors.location = "Please select a valid main location.";
      if (!currentFormData.startDate)
        errors.startDate = "Start date is required.";
      if (
        !isEditing &&
        currentFormData.startDate &&
        new Date(currentFormData.startDate) < new Date().setHours(0, 0, 0, 0)
      ) {
        errors.startDate = "Start date cannot be in the past.";
      }
      if (
        !currentFormData.durationDays ||
        parseInt(currentFormData.durationDays) <= 0
      )
        errors.durationDays = "Duration must be at least 1 day.";
      if (
        !currentFormData.pricePerPerson ||
        parseFloat(currentFormData.pricePerPerson) < 0
      )
        errors.pricePerPerson = "Price is required and cannot be negative.";
      if (
        !currentFormData.maxParticipants ||
        parseInt(currentFormData.maxParticipants) <= 0
      )
        errors.maxParticipants = "Max participants must be at least 1.";
      if (!selectedTags || selectedTags.length === 0)
        errors.tags = "Please select at least one tag.";
      if (!currentFormData.meetUpPoint?.coordinates) {
        errors.meetUpPoint = "Please select a valid starting/meet-up point.";
      }
    }

    if (step === 2) {
      const itineraryErrors = [];
      currentFormData.itinerary.forEach((dayData, index) => {
        if (!dayData.location?.coordinates) {
          itineraryErrors.push({
            index,
            day: dayData.day,
            field: "location",
            message: `Please select a valid location for Day ${dayData.day}.`,
          });
        }
      });
      if (itineraryErrors.length > 0) {
        errors.itinerary = itineraryErrors;
      }
    }
    return errors;
  };

  useEffect(() => {
    const errors = validateStep(currentStep, formData);
    setStepErrors(errors);
    setIsCurrentStepValid(Object.keys(errors).length === 0);
  }, [formData, currentStep, selectedTags]);

  const nextStep = (e) => {
    console.log(
      `[Admin RidePlanning] nextStep CALLED from step ${currentStep}`
    );
    if (e) e.preventDefault();
    setShowErrors(false);
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length === 0) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setError(null);
      }
    } else {
      console.warn(
        "[Admin RidePlanning] Validation failed for step:",
        currentStep,
        errors
      );
      setStepErrors(errors);
      setShowErrors(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowErrors(false);
      setError(null);
    }
  };

  const getCurrentStepTitle = () => {
    if (currentStep === 1) return "Trip Details";
    if (currentStep === 2) return "Build Itinerary";
    if (currentStep === 3) return "Map Route Preview";
    if (currentStep === 4) return "Manage Photos";
    return isEditing ? "Edit Trip" : "Plan New Trip";
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "var(--color-border)",
      boxShadow: "none",
      "&:hover": {
        borderColor: "var(--color-primary)",
      },
      padding: "0.25rem",
      minHeight: "46px",
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
    placeholder: (provided) => ({
      ...provided,
      color: "var(--color-txt-tertiary)",
    }),
    input: (provided) => ({
      ...provided,
      marginLeft: "0.5rem",
    }),
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
        <p className="ml-4 text-[var(--color-txt-secondary)] text-lg">
          Loading trip data...
        </p>
      </div>
    );
  }

  if (isEditing && error && !initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 bg-red-100 p-4 rounded border border-red-300 mb-4">
          {error}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          className="mt-4"
        >
          Retry Fetch
        </Button>
        <Button
          onClick={() => navigate("/admin/manage-trips")}
          variant="neutral"
          className="mt-4 ml-2"
        >
          Back to List
        </Button>
      </div>
    );
  }

  const getImageUrl = (imagePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (baseUrl) {
      const cleanBasePath = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
      const cleanImagePath = imagePath.startsWith("/")
        ? imagePath.slice(1)
        : imagePath;
      return `${cleanBasePath}/${cleanImagePath}`;
    }
    return "/placeholder-image.jpg";
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-secondary)] filter blur-3xl"></div>
          <div className="absolute bottom-12 -left-24 w-64 h-64 rounded-full bg-[var(--color-primary)] filter blur-3xl"></div>
        </div>

        <div className="relative z-10 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center">
                {isEditing ? (
                  <>
                    <PencilSquareIcon className="h-8 w-8 mr-3 text-[var(--color-primary)]" />
                    Edit Trip
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-8 w-8 mr-3 text-[var(--color-primary)]" />
                    Plan New Trip
                  </>
                )}
              </h1>
              <p className="text-[var(--color-txt-secondary)] mt-2">
                {isEditing
                  ? `Modifying trip: ${formData.title || tripId}`
                  : "Design the itinerary and details for a new trip"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="relative z-10 mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded shadow-sm">
            <p>
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <Card className="relative z-10 p-6">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-center mb-2">
              {getCurrentStepTitle()}
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[var(--color-primary)] h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 animate-fade-in">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Trip Title *{" "}
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Annapurna Circuit Adventure"
                        className={`w-full px-4 py-3 border ${
                          showErrors && stepErrors.title
                            ? "border-red-500"
                            : "border-[var(--color-border)]"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]`}
                        required
                      />
                      {showErrors && stepErrors.title && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.title}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Description *{" "}
                      </label>
                      <textarea
                        id="description"
                        rows="4"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        placeholder="Detailed overview of the trip, highlights, requirements..."
                        className={`w-full px-4 py-3 border ${
                          showErrors && stepErrors.description
                            ? "border-red-500"
                            : "border-[var(--color-border)]"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]`}
                        required
                      ></textarea>
                      {showErrors && stepErrors.description && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.description}
                        </p>
                      )}
                    </div>
                    <LocationInput
                      id="location"
                      name="location"
                      label="Main Location / Region *"
                      placeholder="e.g., Pokhara, Annapurna Region"
                      initialValue={formData.location.name}
                      onLocationSelect={handleLocationChange}
                      required={true}
                    />
                    {showErrors && stepErrors.location && (
                      <p className="text-xs text-red-600 mt-1">
                        {stepErrors.location}
                      </p>
                    )}
                    <LocationInput
                      id="meetUpPoint"
                      name="meetUpPoint"
                      label="Starting Point / Meetup *"
                      placeholder="e.g., Thamel, Kathmandu"
                      initialValue={formData.meetUpPoint.name}
                      onLocationSelect={handleMeetupPointChange}
                      required={true}
                    />
                    {showErrors && stepErrors.meetUpPoint && (
                      <p className="text-xs text-red-600 mt-1">
                        {stepErrors.meetUpPoint}
                      </p>
                    )}
                    <div>
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Tags (select up to 7) *{" "}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 top-0 pl-3 pt-3 flex items-center pointer-events-none z-10">
                          <TagIcon className="h-5 w-5 text-[var(--color-txt-tertiary)]" />
                        </div>
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
                          className={`w-full react-select-container ${
                            showErrors && stepErrors.tags
                              ? "react-select-error"
                              : ""
                          }`}
                          classNamePrefix="react-select"
                          styles={customSelectStyles}
                          isOptionDisabled={() => selectedTags.length >= 7}
                          noOptionsMessage={() =>
                            selectedTags.length >= 7
                              ? "Max 7 tags"
                              : tagOptions.length === 0
                              ? "Loading tags..."
                              : "No matching tags"
                          }
                        />
                      </div>
                      {showErrors && stepErrors.tags && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.tags}
                        </p>
                      )}
                      {selectedTags.length >= 7 && (
                        <p className="text-xs text-amber-600 mt-1">
                          {" "}
                          Maximum of 7 tags reached.{" "}
                        </p>
                      )}
                      {tagOptions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {" "}
                          Need a new tag? Add it via Manage Tags.{" "}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Start Date *{" "}
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate || ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          showErrors && stepErrors.startDate
                            ? "border-red-500"
                            : "border-[var(--color-border)]"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]`}
                        required
                      />
                      {showErrors && stepErrors.startDate && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.startDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="durationDays"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Duration (Days) *{" "}
                      </label>
                      <input
                        type="number"
                        id="durationDays"
                        name="durationDays"
                        value={formData.durationDays || ""}
                        onChange={handleInputChange}
                        min="1"
                        step="1"
                        placeholder="e.g., 7"
                        className={`w-full px-4 py-3 border ${
                          showErrors && stepErrors.durationDays
                            ? "border-red-500"
                            : "border-[var(--color-border)]"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]`}
                        required
                      />
                      {showErrors && stepErrors.durationDays && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.durationDays}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="pricePerPerson"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Price (NPR/Rs.) *{" "}
                      </label>
                      <input
                        type="number"
                        id="pricePerPerson"
                        name="pricePerPerson"
                        value={formData.pricePerPerson || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        placeholder="e.g., 25000"
                        className={`w-full px-4 py-3 border ${
                          showErrors && stepErrors.pricePerPerson
                            ? "border-red-500"
                            : "border-[var(--color-border)]"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]`}
                        required
                      />
                      {showErrors && stepErrors.pricePerPerson && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.pricePerPerson}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="maxParticipants"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Max Participants *{" "}
                      </label>
                      <input
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        value={formData.maxParticipants || ""}
                        onChange={handleInputChange}
                        min="1"
                        step="1"
                        placeholder="e.g., 12"
                        className={`w-full px-4 py-3 border ${
                          showErrors && stepErrors.maxParticipants
                            ? "border-red-500"
                            : "border-[var(--color-border)]"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]`}
                        required
                      />
                      {showErrors && stepErrors.maxParticipants && (
                        <p className="text-xs text-red-600 mt-1">
                          {stepErrors.maxParticipants}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="distance"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Approx. Distance (km) (Optional){" "}
                      </label>
                      <input
                        type="number"
                        id="distance"
                        name="distance"
                        value={formData.distance || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        placeholder="e.g., 150"
                        className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="difficulty"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Difficulty{" "}
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty || "Moderate"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Difficult">Difficult</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="transportType"
                        className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                      >
                        {" "}
                        Primary Transport Type{" "}
                      </label>
                      <select
                        id="transportType"
                        name="transportType"
                        value={formData.transportType || "Motorcycle"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                        required
                      >
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Car">Car</option>
                        <option value="Bicycle">Bicycle</option>
                        <option value="Trekking">Trekking</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[var(--color-txt-primary)] flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-[var(--color-primary)]" />{" "}
                      Daily Itinerary
                    </h3>
                    <Badge variant="secondary">
                      {formData.itinerary.length}{" "}
                      {formData.itinerary.length === 1 ? "Day" : "Days"}
                    </Badge>
                  </div>
                  {showErrors &&
                    stepErrors.itinerary &&
                    Array.isArray(stepErrors.itinerary) &&
                    stepErrors.itinerary.length > 0 && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-700">
                          Please fix the following itinerary errors:
                        </p>
                        <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                          {stepErrors.itinerary.map((err) => (
                            <li key={`${err.index}-${err.field}`}>
                              {err.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <div className="space-y-4">
                    {formData.itinerary.map((day, index) => {
                      const dayErrors = Array.isArray(stepErrors.itinerary)
                        ? stepErrors.itinerary.find(
                            (err) => err.index === index
                          )
                        : null;
                      return (
                        <ItineraryDay
                          key={day.day}
                          dayIndex={index}
                          dayData={day}
                          onDataChange={handleItineraryChange}
                          onRemove={removeDay}
                          showErrors={showErrors}
                          dayErrors={dayErrors}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addDay}
                      icon={<PlusCircleIcon className="h-5 w-5" />}
                    >
                      Add Another Day
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-[var(--color-txt-primary)] mb-2">
                    Route Preview
                  </h3>
                  <p className="text-[var(--color-txt-secondary)] text-sm mb-4">
                    This map previews the calculated route based on your main
                    location and daily itinerary locations.
                  </p>
                  <div
                    ref={createMapContainerRef}
                    className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-gray-100"
                    style={{ height: "450px" }}
                  >
                    <InteractiveMap
                      startLocation={formData.meetUpPoint}
                      itineraryLocations={formData.itinerary}
                      height={450}
                      profile={
                        formData.transportType === "Bicycle"
                          ? "cycling-road"
                          : formData.transportType === "Trekking"
                          ? "foot-hiking"
                          : "driving-car"
                      }
                      key={`map-${formData.location?.coordinates?.join("-")}-${
                        formData.itinerary.length
                      }`}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-[var(--color-txt-primary)] mb-2">
                    Manage Images
                  </h3>
                  {isEditing && formData.existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-[var(--color-txt-secondary)] mb-2">
                        Current Images:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {formData.existingImages.map((imagePath, index) => (
                          <div key={index} className="relative group w-24 h-24">
                            <img
                              src={getImageUrl(imagePath)}
                              alt={`Current image ${index + 1}`}
                              className="object-cover w-full h-full rounded-md shadow-sm border border-[var(--color-border)]"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imagePath)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-90 transition-opacity duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                              aria-label="Mark existing image for removal"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Click 'X' to mark an image for removal upon saving.
                      </p>
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="rideImages"
                      className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                    >
                      {isEditing ? "Upload New Images" : "Upload Images"}{" "}
                      (Optional)
                    </label>
                    <input
                      type="file"
                      id="rideImages"
                      name="rideImages"
                      onChange={handleImageChange}
                      multiple
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {imagesToUpload.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-[var(--color-txt-secondary)] mb-2">
                          New Images to Upload ({imagesToUpload.length}):
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {imagesToUpload.map((file, index) => (
                            <div
                              key={index}
                              className="relative group w-24 h-24"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="object-cover w-full h-full rounded-md shadow-sm border border-[var(--color-border-light)]"
                                onLoad={() => URL.revokeObjectURL(file.preview)}
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImagePreview(index)}
                                className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-90 transition-opacity duration-200 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                                aria-label="Remove new image preview"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Images will be uploaded/updated when you save the trip.
                      Max 10MB total.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                    icon={<ChevronLeftIcon className="h-5 w-5 mr-1" />}
                  >
                    Back
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button
                    type="button"
                    variant="neutral"
                    onClick={() => navigate("/admin/manage-trips")}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid || loading}
                    icon={<ChevronRightIcon className="h-5 w-5 ml-1" />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={loading || initialLoading || !isCurrentStepValid}
                    className="min-w-[150px]"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />{" "}
                        Saving...
                      </>
                    ) : isEditing ? (
                      "Update Trip"
                    ) : (
                      "Create Trip"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
      <style jsx global>{`
        .react-select-container .react-select__control {
          padding-left: 2.5rem;
        }
        .react-select-container .react-select__placeholder,
        .react-select-container .react-select__input-container {
          margin-left: 0.5rem;
          color: var(--color-txt-tertiary);
        }
        .react-select__control--is-focused {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 1px var(--color-primary) !important;
        }
        .react-select__multi-value {
          background-color: var(--color-primary-light);
        }
        .react-select__multi-value__label {
          color: var(--color-primary-dark);
          font-weight: 500;
        }
        .react-select__multi-value__remove {
          color: var(--color-primary);
        }
        .react-select__multi-value__remove:hover {
          background-color: var(--color-primary);
          color: white;
        }
        .react-select-error .react-select__control {
          border-color: #f87171 !important;
          box-shadow: 0 0 0 1px #f87171 !important;
        }
        .react-select-error .react-select__control:hover {
          border-color: #ef4444 !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RidePlanningPage;
