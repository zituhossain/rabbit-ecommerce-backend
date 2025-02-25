const mongoose = require("mongoose");

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log error for debugging

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";

  // Handle Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue);
    message = `Duplicate field value entered for: ${field}`;
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Resource not found with id: ${err.value}`;
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, authorization denied";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please login again";
  }

  // Send Error Response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
