// src/utils/formatDate.js
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    // Use options consistent with your display needs
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return "Invalid Date";
  }
};
