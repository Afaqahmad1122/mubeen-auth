import OTP from "../models/OTP.js";
import { sendOTPviaSMS, verifyOTPCode } from "./smsService.js";
import { sendOTPviaEmail } from "./emailService.js";

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (cleaned.startsWith("92")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+92${cleaned.substring(1)}`;
  } else {
    return `+92${cleaned}`;
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createAndSendOTP = async (phoneNumber, email = null) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    throw new Error("Invalid phone number format");
  }

  await OTP.deleteMany({ phoneNumber: formattedPhone, verified: false });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    if (email) {
      await sendOTPviaEmail(email, otp);
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
      await sendOTPviaEmail(email, otp);
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

  if (otpRecord.otp === "VERIFY_API") {
    const verificationResult = await verifyOTPCode(formattedPhone, otp);
    if (!verificationResult.valid) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
          valid: false,
          message: "Maximum attempts exceeded. Please request a new OTP",
        };
      }
      await otpRecord.save();
      return {
        valid: false,
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining`,
      };
    }
  } else {
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
          valid: false,
          message: "Maximum attempts exceeded. Please request a new OTP",
        };
      }
      await otpRecord.save();
      return {
        valid: false,
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining`,
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
