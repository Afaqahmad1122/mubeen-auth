import * as otpService from "../services/otpService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const requestOTP = async (req, res, next) => {
  try {
    const { phoneNumber, email } = req.body;

    if (!phoneNumber) {
      return sendError(res, "Phone number is required", 400);
    }

    await otpService.createAndSendOTP(phoneNumber, email);

    const deliveryMethod = email ? "email" : "SMS";
    return sendSuccess(
      res,
      { phoneNumber, email: email || null },
      `OTP sent successfully via ${deliveryMethod}. Valid for ${
        process.env.OTP_EXPIRY_MINUTES || 10
      } minutes.`,
      200
    );
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return sendError(res, "Phone number and OTP are required", 400);
    }

    const result = await otpService.verifyOTP(phoneNumber, otp);

    if (!result.valid) {
      return sendError(res, result.message, 400);
    }

    return sendSuccess(
      res,
      { phoneNumber, verified: true },
      result.message,
      200
    );
  } catch (error) {
    next(error);
  }
};
