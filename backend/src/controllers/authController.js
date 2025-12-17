import * as userService from "../services/userService.js";
import * as otpService from "../services/otpService.js";
import * as authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { OTP_CONFIG } from "../config/constants.js";

export const login = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return sendError(res, "Email is required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userService.getUserByEmail(normalizedEmail);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    await otpService.createAndSendEmailOTP(normalizedEmail, "login", {
      userId: user._id.toString(),
      timestamp: new Date().toISOString(),
    });

    return sendSuccess(
      res,
      { email: normalizedEmail },
      `OTP sent to your email. Please verify to login. Valid for ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
      200
    );
  } catch (error) {
    next(error);
  }
};

export const verifyLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || typeof email !== "string") {
      return sendError(res, "Email is required", 400);
    }

    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return sendError(res, "Valid 6-digit OTP is required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await otpService.verifyEmailOTP(
      normalizedEmail,
      otp.trim(),
      "login"
    );

    if (!result.valid) {
      return sendError(res, result.message, 400);
    }

    const user = await userService.getUserByEmail(normalizedEmail);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { accessToken, refreshToken } = authService.generateTokens(user._id);

    await authService.saveToken(user._id, accessToken, "access");
    await authService.saveToken(user._id, refreshToken, "refresh");

    const userResponse = user.toObject();
    delete userResponse.__v;

    return sendSuccess(
      res,
      {
        user: userResponse,
        accessToken,
        refreshToken,
      },
      "Login successful",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        await authService.invalidateToken(token);
      } catch (error) {
        // Token might already be invalid, continue with logout
      }
    }

    return sendSuccess(res, null, "Logout successful", 200);
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return sendError(res, "User ID required", 400);
    }

    await authService.invalidateAllUserTokens(userId);

    return sendSuccess(res, null, "Logged out from all devices", 200);
  } catch (error) {
    next(error);
  }
};
