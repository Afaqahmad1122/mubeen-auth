import * as otpService from "../services/otpService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { OTP_CONFIG } from "../config/constants.js";

export const requestOTP = async (req, res, next) => {
  try {
    const { phoneNumber, email } = req.body;

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return sendError(res, "Phone number is required", 400);
    }

    if (email && typeof email !== "string") {
      return sendError(res, "Invalid email format", 400);
    }

    await otpService.createAndSendOTP(
      phoneNumber.trim(),
      email?.trim() || null
    );

    const deliveryMethod = email ? "email" : "SMS";
    return sendSuccess(
      res,
      { phoneNumber: phoneNumber.trim(), email: email?.trim() || null },
      `OTP sent successfully via ${deliveryMethod}. Valid for ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
      200
    );
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return sendError(res, "Phone number is required", 400);
    }

    if (!otp || typeof otp !== "string") {
      return sendError(res, "OTP is required", 400);
    }

    const result = await otpService.verifyOTP(phoneNumber.trim(), otp.trim());

    if (!result.valid) {
      return sendError(res, result.message, 400);
    }

    return sendSuccess(
      res,
      { phoneNumber: phoneNumber.trim(), verified: true },
      result.message,
      200
    );
  } catch (error) {
    next(error);
  }
};
