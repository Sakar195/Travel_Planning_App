/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} dateStr - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return "N/A";

  try {
    const date = new Date(dateStr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // Default options
    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Error formatting date";
  }
};

/**
 * Format a price value to a currency string
 * @param {number} price - Price value
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = "USD") => {
  if (price === undefined || price === null) return "N/A";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    console.error("Price formatting error:", error);
    return `${price} ${currency}`;
  }
};

/**
 * Truncate text to a specific length and add ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + "...";
};
