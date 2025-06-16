import React from "react";

const Badge = ({
  children,
  variant = "primary",
  size = "default",
  rounded = "full",
  className = "",
  onClick = null,
}) => {
  // Size variants
  const sizeMap = {
    small: "text-xs px-2 py-0.5",
    default: "text-xs px-2.5 py-0.5",
    large: "text-sm px-3 py-1",
  };

  // Border radius options
  const roundedMap = {
    full: "rounded-full",
    medium: "rounded-md",
    large: "rounded-lg",
  };

  // Variant styles
  const variantMap = {
    primary:
      "bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]",
    secondary:
      "bg-[var(--color-secondary)] bg-opacity-15 text-[var(--color-secondary-hover)]",
    success:
      "bg-[var(--color-success)] bg-opacity-10 text-[var(--color-success)]",
    warning:
      "bg-[var(--color-warning)] bg-opacity-10 text-[var(--color-warning)]",
    error: "bg-[var(--color-error)] bg-opacity-10 text-[var(--color-error)]",
    gray: "bg-gray-100 text-gray-600",
  };

  const sizeClass = sizeMap[size] || sizeMap.default;
  const variantClass = variantMap[variant] || variantMap.primary;
  const roundedClass = roundedMap[rounded] || roundedMap.full;
  const isClickable = onClick !== null;

  return (
    <span
      className={`
        inline-flex items-center font-medium ${sizeClass} ${variantClass} ${roundedClass}
        ${
          isClickable
            ? "cursor-pointer hover:bg-opacity-20 transition-colors"
            : ""
        }
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
    >
      {children}
    </span>
  );
};

export default Badge;
