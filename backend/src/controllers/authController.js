import * as userService from "../services/userService.js";
import * as otpService from "../services/otpService.js";
import * as authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { OTP_CONFIG } from "../config/constants.js";

export const login = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return sendError(res, "Phone number is required", 400);
    }

    const user = await userService.getUserByPhoneNumber(phoneNumber);

    if (!user) {
      return sendError(res, "User not found with this phone number", 404);
    }

    const metadata = {
      userId: user._id.toString(),
      timestamp: new Date().toISOString(),
    };

    // Generate random OTP and return in response
    const otpResult = await otpService.createMobileLoginOTP(
      phoneNumber,
      metadata
    );

    return sendSuccess(
      res,
      {
        phoneNumber: otpResult.phoneNumber,
        otp: otpResult.otpCode, // Random OTP returned in response
        expiresIn: otpResult.expiresIn,
      },
      `OTP generated successfully. Valid for ${otpResult.expiresIn} minutes.`,
      200
    );
  } catch (error) {
    next(error);
  }
};

export const verifyLogin = async (req, res, next) => {
  try {
    // Debug logging
    console.log("[Verify Login] Full request body:", JSON.stringify(req.body));
    console.log("[Verify Login] Content-Type:", req.headers["content-type"]);
    console.log("[Verify Login] Raw body:", req.body);

    const { phoneNumber, otp } = req.body;

    console.log("[Verify Login] Extracted values:", {
      phoneNumber,
      otp,
      phoneNumberType: typeof phoneNumber,
      otpType: typeof otp,
    });

    // Validate inputs
    const errors = [];

    if (!phoneNumber) {
      errors.push("Phone number is required");
    } else if (typeof phoneNumber !== "string") {
      errors.push("Phone number must be a string");
    } else if (phoneNumber.trim().length === 0) {
      errors.push("Phone number cannot be empty");
    }

    if (!otp) {
      errors.push("OTP is required");
    } else if (typeof otp !== "string") {
      errors.push("OTP must be a string");
    } else if (otp.trim().length === 0) {
      errors.push("OTP cannot be empty");
    } else if (otp.trim().length !== 6) {
      errors.push(
        `Valid 6-digit OTP is required. Received ${otp.trim().length} digits`
      );
    }

    if (errors.length > 0) {
      console.log("[Verify Login] Validation errors:", errors);
      return sendError(res, errors.join(". "), 400);
    }

    // Verify OTP via phoneNumber
    const result = await otpService.verifyMobileLoginOTP(
      phoneNumber,
      otp.trim()
    );

    if (!result.valid) {
      return sendError(res, result.message || "OTP verification failed", 400);
    }

    // Get user from metadata or by phoneNumber
    let user = null;
    if (result.metadata && result.metadata.userId) {
      user = await userService.getUserById(result.metadata.userId);
    } else {
      user = await userService.getUserByPhoneNumber(phoneNumber);
    }

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
