import OTP from "../models/OTP.js";
import { sendOTPviaSMS, verifyOTPCode } from "./smsService.js";
import { sendOTPviaEmail } from "./emailService.js";
import { OTP_CONFIG } from "../config/constants.js";

const PHONE_REGEX = /^(\+92|92|0)?[0-9]{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== "string") return null;

  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.length < 10 || cleaned.length > 12) return null;

  if (cleaned.startsWith("92") && cleaned.length === 12) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+92${cleaned.substring(1)}`;
  } else if (cleaned.length === 10) {
    return `+92${cleaned}`;
  }

  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

const generateOTP = () => {
  const min = Math.pow(10, OTP_CONFIG.LENGTH - 1);
  const max = Math.pow(10, OTP_CONFIG.LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

export const createAndSendOTP = async (phoneNumber, email = null) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    throw new Error("Invalid phone number format");
  }

  if (email && !validateEmail(email)) {
    throw new Error("Invalid email format");
  }

  await OTP.deleteMany({ phoneNumber: formattedPhone, verified: false });

  const otp = generateOTP();
  const expiresAt = new Date(
    Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000
  );

  try {
    if (email) {
      await sendOTPviaEmail(email.trim().toLowerCase(), otp);
    } else {
      await sendOTPviaSMS(formattedPhone);
      return await OTP.create({
        phoneNumber: formattedPhone,
        otp: "VERIFY_API",
        expiresAt,
        verified: false,
      });
    }
  } catch (smsError) {
    if (
      smsError.message.includes("unverified") ||
      smsError.message.includes("restricted")
    ) {
      if (!email) {
        throw new Error(
          "SMS not available for unverified numbers. Please provide email for OTP delivery."
        );
      }
      await sendOTPviaEmail(email.trim().toLowerCase(), otp);
    } else {
      throw smsError;
    }
  }

  const otpRecord = await OTP.create({
    phoneNumber: formattedPhone,
    otp,
    expiresAt,
    verified: false,
  });

  return otpRecord;
};

export const verifyOTP = async (phoneNumber, otp) => {
  if (!otp || typeof otp !== "string" || otp.length !== OTP_CONFIG.LENGTH) {
    return { valid: false, message: "Invalid OTP format" };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return { valid: false, message: "Invalid phone number format" };
  }

  const otpRecord = await OTP.findOne({
    phoneNumber: formattedPhone,
    verified: false,
  });

  if (!otpRecord) {
    return { valid: false, message: "OTP not found or already used" };
  }

  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ _id: otpRecord._id });
    return { valid: false, message: "OTP has expired" };
  }

  if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpRecord._id });
    return {
      valid: false,
      message: "Maximum attempts exceeded. Please request a new OTP",
    };
  }

  if (otpRecord.otp === "VERIFY_API") {
    const verificationResult = await verifyOTPCode(formattedPhone, otp);
    if (!verificationResult.valid) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
          valid: false,
          message: "Maximum attempts exceeded. Please request a new OTP",
        };
      }
      await otpRecord.save();
      return {
        valid: false,
        message: `Invalid OTP. ${
          OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts
        } attempts remaining`,
      };
    }
  } else {
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
          valid: false,
          message: "Maximum attempts exceeded. Please request a new OTP",
        };
      }
      await otpRecord.save();
      return {
        valid: false,
        message: `Invalid OTP. ${
          OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts
        } attempts remaining`,
      };
    }
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return { valid: true, message: "OTP verified successfully" };
};

export const isPhoneVerified = async (phoneNumber) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) return false;

  const otpRecord = await OTP.findOne({
    phoneNumber: formattedPhone,
    verified: true,
  });
  return !!otpRecord;
};
