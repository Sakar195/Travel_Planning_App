import React, { useState, useEffect, useRef } from "react";
import {
  CalendarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  TagIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Card from "../Common/Card";
import Button from "../Common/Button";
import Badge from "../Common/Badge";
import ItineraryDay from "./ItineraryDay";
import { createTrip, uploadImages } from "../../services/tripService";
import { getAllTags } from "../../services/tagService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Common/LoadingSpinner";
import Select from "react-select";
import InteractiveMap from "../Common/InteractiveMap";
import LocationInput from "../Common/LocationInput";

const PlanTripForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: { name: "", coordinates: null },
    startDate: "",
    durationDays: "",
    distance: "",
    difficulty: "Moderate",
    transportType: "Motorcycle",
    meetUpPoint: { name: "", coordinates: null },
    itinerary: [
      {
        day: 1,
        location: { name: "", coordinates: null },
        activities: [],
        lodging: "",
        notes: "",
      },
    ],
    tags: [],
    route: [],
    images: [],
  });
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [stepErrors, setStepErrors] = useState({});
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const createMapContainerRef = useRef(null);
  const totalSteps = 4; // Fixed number of steps: 1.Details, 2.Itinerary, 3.Map, 4.Photos

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

  const validateStep = (step, currentFormData) => {
    const errors = {};
    if (step === 1) {
      if (!currentFormData.title.trim())
        errors.title = "Trip title is required.";
      if (!currentFormData.description.trim())
        errors.description = "Description is required.";
      if (!currentFormData.location?.coordinates)
        errors.location =
          "Please select a valid main location from suggestions.";
      if (!currentFormData.startDate)
        errors.startDate = "Start date is required.";
      if (
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
        currentFormData.meetUpPoint?.name &&
        !currentFormData.meetUpPoint?.coordinates
      ) {
        errors.meetUpPoint =
          "Please select a valid starting point from suggestions or clear the field.";
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
  }, [formData, currentStep]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    console.log(
      `[PlanTripForm] Itinerary Day ${index} field '${field}' changed:`,
      value
    );
    setFormData((currentData) => ({
      ...currentData,
      itinerary: currentData.itinerary.map((day, i) => {
        if (i === index) {
          const updatedValue =
            field === "location"
              ? value || { name: "", coordinates: null }
              : value;
          return { ...day, [field]: updatedValue };
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
          activities: [],
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
      setImageFiles(Array.from(e.target.files));
    } else {
      setImageFiles([]);
    }
  };

  const handleTagChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 7) {
      selectedOptions = selectedOptions.slice(0, 7);
    }
    setSelectedTags(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
  };

  const handleLocationChange = (locationData) => {
    console.log("[PlanTripForm] Main Location selected:", locationData);
    setFormData((prev) => ({
      ...prev,
      location: locationData || { name: "", coordinates: null },
    }));
  };

  const handleMeetupPointChange = (locationData) => {
    console.log("[PlanTripForm] Meetup Point selected:", locationData);
    setFormData((prev) => ({
      ...prev,
      meetUpPoint: locationData || { name: "", coordinates: null },
    }));
  };

  const handleSubmit = async (e) => {
    console.log("[PlanTripForm] handleSubmit CALLED");
    e.preventDefault();
    setError(null);

    const step1Errors = validateStep(1, formData);
    const step2Errors = validateStep(2, formData);
    const allErrors = { ...step1Errors, ...step2Errors };

    if (Object.keys(allErrors).length > 0) {
      setError("Please fix the errors in all steps before saving.");
      setStepErrors(allErrors);
      if (Object.keys(step1Errors).length > 0) setCurrentStep(1);
      else if (Object.keys(step2Errors).length > 0) setCurrentStep(2);
      console.error("Final validation failed:", allErrors);
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        console.log("Uploading images...");
        try {
          imageUrls = await uploadImages(imageFiles);
          console.log("Images uploaded, URLs:", imageUrls);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError(
            `Failed to upload images: ${
              uploadError.message || "Server error"
            }. Please try again.`
          );
          setLoading(false);
          return;
        }
      }

      const dataToSubmit = {
        ...formData,
        durationDays: parseInt(formData.durationDays) || null,
        distance: parseFloat(formData.distance) || null,
        tags: selectedTags,
        images: imageUrls,
      };

      console.log("Submitting trip plan:", dataToSubmit);

      const newTrip = await createTrip(dataToSubmit);
      console.log("Trip created:", newTrip);

      navigate("/my-rides");
    } catch (err) {
      setError(err.message || "Failed to create trip plan.");
      console.error("Trip creation error:", err);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(() => {
        if (createMapContainerRef.current) {
          console.log("[PlanTripForm] Map Container Dimensions:", {
            width: createMapContainerRef.current.offsetWidth,
            height: createMapContainerRef.current.offsetHeight,
          });
        }
      }, 100);
    }
  }, [currentStep]);

  const nextStep = (e) => {
    console.log(`[PlanTripForm] nextStep CALLED from step ${currentStep}`);
    if (e) e.preventDefault();
    setShowErrors(false);
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length === 0) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.warn(
        "[PlanTripForm] Validation failed for step:",
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
    }
  };

  const getCurrentStepTitle = () => {
    if (currentStep === 1) return "Trip Details";
    if (currentStep === 2) return "Build Itinerary";
    if (currentStep === 3) return "Map Route Preview";
    if (currentStep === 4) return "Upload Photos";
    return "Plan Your Trip";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded shadow-sm">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
      <Card className="p-6">
        <div className="mb-4 border-b border-gray-200 pb-4">
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

        <div className="min-h-[350px]">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                  >
                    Trip Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., My Weekend Getaway to Pokhara"
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
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="3"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief overview of the trip..."
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
                  placeholder="e.g., Pokhara Valley, Nepal"
                  initialValue={formData.location.name}
                  onLocationSelect={handleLocationChange}
                  required={true}
                />
                {showErrors && stepErrors.location && (
                  <p className="text-xs text-red-600 mt-1">
                    {stepErrors.location}
                  </p>
                )}

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
                    placeholder="e.g., 3"
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
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="distance"
                    className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                  >
                    Estimated Distance (km){" "}
                    <span className="text-xs">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g., 250.5"
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                  >
                    Perceived Difficulty{" "}
                    <span className="text-xs">(Optional)</span>
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Difficult">Difficult</option>
                    <option value="Strenuous">Strenuous</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                  >
                    Tags (select up to 7){" "}
                    <span className="text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 top-0 pl-3 flex items-center pointer-events-none z-10"></div>
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
                      className="w-full react-select-container"
                      classNamePrefix="react-select"
                      styles={customSelectStyles}
                      isOptionDisabled={() => selectedTags.length >= 7}
                      noOptionsMessage={() =>
                        selectedTags.length >= 7
                          ? "Maximum 7 tags allowed"
                          : "No options available"
                      }
                    />
                  </div>
                  {selectedTags.length >= 7 && (
                    <p className="text-sm text-amber-600 mt-1">
                      Maximum of 7 tags reached
                    </p>
                  )}
                </div>
                <LocationInput
                  id="meetUpPoint"
                  name="meetUpPoint"
                  label="Starting Point / Meetup"
                  placeholder="e.g., Thamel, Kathmandu"
                  initialValue={formData.meetUpPoint.name}
                  onLocationSelect={handleMeetupPointChange}
                  required={false}
                />
                {showErrors && stepErrors.meetUpPoint && (
                  <p className="text-xs text-red-600 mt-1">
                    {stepErrors.meetUpPoint}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
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
                        <li key={err.index}>{err.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              <div className="space-y-4">
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
              <div className="mt-6">
                <Button
                  type="button"
                  onClick={addDay}
                  variant="secondary"
                  icon={<PlusCircleIcon className="h-5 w-5" />}
                >
                  Add Another Day
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[var(--color-txt-primary)] mb-2">
                Route Preview
              </h3>
              <p className="text-[var(--color-txt-secondary)] text-sm mb-4">
                This map previews the calculated route based on your starting
                point and daily locations.
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
                      : "driving-car"
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[var(--color-txt-primary)] mb-2">
                Upload Photos
              </h3>
              <div>
                <label
                  htmlFor="rideImages"
                  className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
                >
                  Ride Images (Optional)
                </label>
                <input
                  type="file"
                  id="rideImages"
                  name="rideImages"
                  onChange={handleImageChange}
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>
              {imageFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full rounded-md shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between items-center">
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
          </div>

          <div>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
                disabled={!isCurrentStepValid}
                icon={<ChevronRightIcon className="h-5 w-5 ml-1" />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={loading || !isCurrentStepValid}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" /> Saving...
                  </>
                ) : (
                  "Save Ride Plan"
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </form>
  );
};

export default PlanTripForm;
