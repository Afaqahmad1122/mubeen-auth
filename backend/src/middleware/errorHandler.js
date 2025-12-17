import { sendError } from "../utils/response.js";

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error("Error:", err);

  let statusCode = 500;
  let message = err.message || "Server Error";

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
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

  return sendError(res, message, statusCode);
};

export default errorHandler;
