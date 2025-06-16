import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  className = "",
  padding = "default",
  hover = false,
  bordered = true,
  onClick = null,
}) => {
  // Padding options
  const paddingMap = {
    none: "p-0",
    sm: "p-3",
    default: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  const paddingClass = paddingMap[padding] || paddingMap.default;

  // Determine if the card should be interactive
  const isInteractive = hover || onClick;

  const cardClasses = `
    bg-white
    rounded-xl
    shadow-[var(--shadow-card)]
    ${bordered ? "border border-[var(--color-border)]" : ""}
    ${paddingClass}
    ${
      isInteractive
        ? "transition-all duration-300 hover:shadow-[var(--shadow-lg)] transform hover:-translate-y-1"
        : ""
    }
    ${isInteractive && !onClick ? "cursor-default" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {title && (
        <div className="mb-4">
          <h3 className="font-medium text-lg text-[var(--color-txt-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--color-txt-tertiary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
