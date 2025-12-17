import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
import User from "../models/User.js";

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    console.error("ERROR: JWT_SECRET is not set in environment variables!");
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

const getJWTExpiry = () => {
  return process.env.JWT_EXPIRY?.trim() || "7d";
};

const getRefreshTokenExpiry = () => {
  return process.env.REFRESH_TOKEN_EXPIRY?.trim() || "30d";
};

export const generateTokens = (userId) => {
  const JWT_SECRET = getJWTSecret();
  const JWT_EXPIRY = getJWTExpiry();
  const REFRESH_TOKEN_EXPIRY = getRefreshTokenExpiry();

  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export const saveToken = async (userId, token, type = "access") => {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await Token.create({
    token,
    userId,
    expiresAt,
    type,
  });
};

export const verifyToken = async (token) => {
  try {
    const JWT_SECRET = getJWTSecret();
    const decoded = jwt.verify(token, JWT_SECRET);

    const tokenRecord = await Token.findOne({ token });
    if (!tokenRecord) {
      return { valid: false, message: "Token not found or invalidated" };
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return { valid: false, message: "User not found" };
    }

    return {
      valid: true,
      userId: decoded.userId,
      user,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, message: "Token has expired" };
    }
    return { valid: false, message: "Invalid token" };
  }
};

export const invalidateToken = async (token) => {
  await Token.deleteOne({ token });
};

export const invalidateAllUserTokens = async (userId) => {
  await Token.deleteMany({ userId });
};

export const getUserFromToken = async (token) => {
  const result = await verifyToken(token);
  if (!result.valid) {
    return null;
  }
  return result.user;
};
