import { sendError } from "../utils/response.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Server Error";

  // Log error for debugging
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    console.error("Error:", err);
  } else {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Custom error with statusCode
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (!isDevelopment && statusCode === 500) {
    message = "Internal server error";
  }

  return sendError(res, message, statusCode);
};

export default errorHandler;
