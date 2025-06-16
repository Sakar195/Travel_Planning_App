import React, { useState } from "react";

const Input = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = "",
  helper,
  icon,
  disabled = false,
  autoComplete,
  onFocus,
  onBlur,
  name,
  readOnly = false,
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };

  const containerClass = `mb-4 relative ${className}`;

  const baseInputClass = `
    block w-full px-4 py-2.5 
    text-sm text-[var(--color-txt-primary)] 
    bg-[var(--color-bg)] 
    border border-[var(--color-border)] 
    rounded-md 
    shadow-sm 
    focus:outline-none 
    transition-colors duration-200 ease-in-out
  `;

  const conditionalStyles = `
    ${
      error
        ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error-light)]"
        : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-light)]"
    }
    ${
      disabled || readOnly
        ? "bg-[var(--color-bg-disabled)] text-[var(--color-txt-disabled)] cursor-not-allowed opacity-70"
        : "hover:border-[var(--color-border-hover)]"
    }
    ${focused ? "ring-2 ring-opacity-50" : ""}
    ${icon ? "pl-10" : ""}
  `;

  const inputClass = `${baseInputClass} ${conditionalStyles}`;

  return (
    <div className={containerClass}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 transition-colors duration-200 
            ${
              error
                ? "text-[var(--color-error)]"
                : "text-[var(--color-txt-secondary)]"
            }
            ${focused && !error ? "text-[var(--color-primary)]" : ""}
          `}
        >
          {label}{" "}
          {required && (
            <span className="text-[var(--color-error)] ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span
              className={`text-[var(--color-txt-tertiary)] transition-colors duration-200 ${
                focused && !error ? "text-[var(--color-primary)]" : ""
              }`}
            >
              {icon}
            </span>
          </div>
        )}

        <input
          type={type}
          id={id}
          name={name || id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClass}
          autoComplete={autoComplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--color-error)]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-[var(--color-error)] animate-fade-in">
          {error}
        </p>
      )}

      {helper && !error && (
        <p className="mt-1 text-xs text-[var(--color-txt-tertiary)]">
          {helper}
        </p>
      )}
    </div>
  );
};

export default Input;
