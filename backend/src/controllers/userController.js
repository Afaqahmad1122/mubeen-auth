import * as userService from "../services/userService.js";
import * as otpService from "../services/otpService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { OTP_CONFIG } from "../config/constants.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return sendError(res, "Valid email is required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userService.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return sendError(res, "User with this email already exists", 409);
    }

    const existingPendingOTP = await otpService.checkPendingOTP(
      normalizedEmail,
      "registration"
    );
    if (existingPendingOTP) {
      return sendError(
        res,
        "Registration OTP already sent. Please check your email or wait before requesting again.",
        429
      );
    }

    await otpService.createAndSendEmailOTP(normalizedEmail, "registration", {
      userData: req.body,
      timestamp: new Date().toISOString(),
    });

    return sendSuccess(
      res,
      { email: normalizedEmail },
      `OTP sent to your email. Please verify to complete registration. Valid for ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
      200
    );
  } catch (error) {
    next(error);
  }
};

export const verifyRegistration = async (req, res, next) => {
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
      "registration"
    );

    if (!result.valid) {
      return sendError(res, result.message, 400);
    }

    const existingUser = await userService.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return sendError(res, "User with this email already exists", 409);
    }

    if (!result.metadata || !result.metadata.userData) {
      return sendError(
        res,
        "Registration data expired. Please register again.",
        400
      );
    }

    const registrationData = result.metadata.userData;
    registrationData.email = normalizedEmail;

    const user = await userService.createUser(registrationData);
    const userResponse = user.toObject();
    delete userResponse.__v;

    return sendSuccess(res, userResponse, "User registered successfully", 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, "User with this email already exists", 409);
    }
    next(error);
  }
};
