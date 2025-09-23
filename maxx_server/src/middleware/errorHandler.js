/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    error: 'internal',
    message: 'Internal server error'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse = {
      error: 'invalid-argument',
      message: err.message
    };
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorResponse = {
      error: 'unauthenticated',
      message: 'Authentication required'
    };
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorResponse = {
      error: 'invalid-argument',
      message: 'File size too large'
    };
  } else if (err.message.includes('timeout')) {
    statusCode = 408;
    errorResponse = {
      error: 'deadline-exceeded',
      message: 'Request timeout'
    };
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'Something went wrong';
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'not-found',
    message: `Route ${req.method} ${req.path} not found`
  });
};
