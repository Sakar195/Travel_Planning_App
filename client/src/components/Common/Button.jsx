import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "default",
  disabled = false,
  className = "",
  fullWidth = false,
  icon = null,
  isLoading = false,
}) => {
  // Base styles for all buttons
  const baseStyle =
    "font-medium rounded-md focus:outline-none transition-all duration-200 ease-in-out";

  // Size variants
  let sizeStyle = "";
  switch (size) {
    case "small":
      sizeStyle = "px-3 py-1.5 text-sm";
      break;
    case "large":
      sizeStyle = "px-5 py-2.5 text-base";
      break;
    case "default":
    default:
      sizeStyle = "px-4 py-2 text-sm";
      break;
  }

  // Style variants
  let variantStyle = "";
  switch (variant) {
    case "secondary":
      variantStyle =
        "bg-white text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-bg-light-hover)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 hover:-translate-y-0.5";
      break;
    case "outline":
      variantStyle =
        "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2";
      break;
    case "danger":
      variantStyle =
        "bg-[var(--color-error)] text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:-translate-y-0.5";
      break;
    case "success":
      variantStyle =
        "bg-[var(--color-success)] text-white hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:-translate-y-0.5";
      break;
    case "text":
      variantStyle =
        "bg-transparent text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 underline-offset-2 hover:underline";
      break;
    case "primary":
    default:
      variantStyle =
        "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 hover:-translate-y-0.5";
      break;
  }

  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle = disabled
    ? "opacity-60 cursor-not-allowed pointer-events-none"
    : "";
  const loadingStyle = isLoading ? "relative !text-transparent" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${widthStyle} ${disabledStyle} ${loadingStyle} ${className}`}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}

      {icon && !isLoading && (
        <span className={`inline-flex items-center ${children ? "mr-2" : ""}`}>
          {icon}
        </span>
      )}

      {children}
    </button>
  );
};

export default Button;
