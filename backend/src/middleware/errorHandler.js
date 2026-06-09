/**
 * Global error handler middleware (4 parameter)
 * Menangkap semua error yang tidak di-handle oleh controller
 */
const errorHandler = (err, req, res, next) => {
  // Log error detail di development mode
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
};
module.exports = errorHandler;
