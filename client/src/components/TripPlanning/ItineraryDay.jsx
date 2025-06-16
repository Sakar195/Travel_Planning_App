import React from "react";
import {
  MapPinIcon,
  CalendarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Card from "../Common/Card";
import Button from "../Common/Button";
import LocationInput from "../Common/LocationInput";

// Controlled component for editing a single day's itinerary
const ItineraryDay = ({ dayIndex, dayData, onDataChange, onRemove }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    if (name !== "location") {
      onDataChange(dayIndex, name, finalValue);
    }
  };

  const handleLocationSelect = (locationData) => {
    console.log(`[ItineraryDay ${dayIndex}] Location selected:`, locationData);
    onDataChange(dayIndex, "location", locationData);
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
          type="button"
          variant="danger-outline"
          size="small"
          onClick={() => onRemove(dayIndex)}
          icon={<TrashIcon className="h-4 w-4" />}
          disabled={dayIndex === 0 && true}
        >
          Remove Day
        </Button>
      </div>

      <div className="space-y-4">
        <LocationInput
          id={`location-${dayIndex}`}
          name={`location-${dayIndex}`}
          label="Location *"
          placeholder="e.g., Chitwan National Park, Nepal"
          initialValue={
            typeof dayData.location === "object"
              ? dayData.location?.name
              : dayData.location || ""
          }
          onLocationSelect={handleLocationSelect}
          required={true}
        />

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
            value={dayData.activitiesString || ""}
            onChange={(e) =>
              onDataChange(dayIndex, "activitiesString", e.target.value)
            }
            placeholder="e.g., Safari, Village Tour"
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
          />
        </div>

        <div>
          <label
            htmlFor={`lodging-${dayIndex}`}
            className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
          >
            Lodging (Optional)
          </label>
          <input
            type="text"
            id={`lodging-${dayIndex}`}
            name="lodging"
            value={dayData.lodging || ""}
            onChange={handleInputChange}
            placeholder="e.g., Jungle Villa Resort"
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
          />
        </div>

        <div>
          <label
            htmlFor={`notes-${dayIndex}`}
            className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id={`notes-${dayIndex}`}
            name="notes"
            rows="2"
            value={dayData.notes || ""}
            onChange={handleInputChange}
            placeholder="e.g., Remember binoculars for bird watching"
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
          ></textarea>
        </div>
      </div>
    </Card>
  );
};

export default ItineraryDay;
