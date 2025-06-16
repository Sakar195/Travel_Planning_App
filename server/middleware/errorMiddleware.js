const errorHandler = (err, req, res, next) => {
  // Log the error stack trace (can be enhanced with a proper logger later)
  console.error(err.stack);

  // Determine the status code
  // Use the error's status code if it exists, otherwise default to 500
  const statusCode = err.statusCode || 500;

  // Send the response
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // Optionally include stack trace in development environment
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the next middleware (our errorHandler)
};

module.exports = { errorHandler, notFound };
