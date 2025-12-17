import rateLimit from "express-rate-limit";

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for registration endpoint
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts, please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for OTP requests
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
