import React from "react";
import PlanTripForm from "../components/TripPlanning/PlanTripForm";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

// Renamed from UserRidePlanningPage - Now focused only on creation
const CreateTripPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center">
                <PencilSquareIcon className="h-8 w-8 mr-3" /> Plan Your
                Adventure
              </h1>
              <p className="text-[var(--color-txt-secondary)] mt-2">
                Design your perfect trip itinerary day by day.
              </p>
            </div>
          </div>
        </div>

        {/* Removed Tab Navigation */}

        {/* Render the form directly */}
        <div>
          <PlanTripForm />
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
