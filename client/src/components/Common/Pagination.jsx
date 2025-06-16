import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Pagination component for controlling page navigation
 * 
 * @param {Object} props Component props
 * @param {number} props.currentPage Current active page
 * @param {number} props.totalPages Total number of pages
 * @param {Function} props.onPageChange Function to call when page changes
 * @returns {JSX.Element} Pagination component
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Handle next page click
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Handle previous page click
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // If there's only one page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 border border-gray-300 
                   text-sm font-medium rounded-md text-gray-700 bg-white 
                   hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </button>
        
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center px-3 py-2 border border-gray-300 
                   text-sm font-medium rounded-md text-gray-700 bg-white 
                   hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination; 