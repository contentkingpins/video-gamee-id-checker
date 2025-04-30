/**
 * Utility for handling API errors
 */

/**
 * Logs an error with contextual information
 * @param {string} source - Error source (service name, function, etc.)
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
function logError(source, error, context = {}) {
  console.error(`[${new Date().toISOString()}] ERROR in ${source}:`, {
    message: error.message,
    stack: error.stack,
    ...context
  });
}

/**
 * Creates a standardized API error response
 * @param {string} message - User-friendly error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details (only included in development)
 * @returns {Object} Standardized error object
 */
function createApiError(message, statusCode = 500, details = null) {
  const error = {
    success: false,
    message,
    status: statusCode,
  };
  
  // Only include details in development environment
  if (process.env.NODE_ENV === 'development' && details) {
    error.details = details;
  }
  
  return error;
}

/**
 * Creates an async route handler that catches errors
 * @param {Function} fn - The async route handler function
 * @returns {Function} Express middleware with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  logError,
  createApiError,
  asyncHandler
}; 