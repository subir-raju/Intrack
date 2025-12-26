const { logger } = require("../utils/logger");

const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // Log the error
  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
    message = "Not Found";
  } else if (error.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Duplicate entry";
  } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Referenced record does not exist";
  }

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && {
      error: error.message,
      stack: error.stack,
    }),
  };

  res.status(statusCode).json(errorResponse);
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.name = "NotFoundError";
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
