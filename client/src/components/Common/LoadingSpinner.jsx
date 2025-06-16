import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  fullPage = false,
  className = "",
}) => {
  // Size mapping
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  // Color mapping
  const colorMap = {
    primary: "border-[var(--color-primary)]",
    secondary: "border-[var(--color-secondary)]",
    white: "border-white",
    gray: "border-gray-300",
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;
  const spinnerColor = colorMap[color] || colorMap.primary;

  const spinner = (
    <div
      className={`
        animate-spin rounded-full ${spinnerSize} ${spinnerColor} border-t-transparent
        transition-all duration-300 ease-in-out
        ${className}
      `}
      aria-label="Loading"
    ></div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-[var(--color-txt-secondary)] font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
