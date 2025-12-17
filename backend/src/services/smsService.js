import twilio from "twilio";

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured");
  }

  return twilio(accountSid, authToken);
};

export const sendOTPviaSMS = async (phoneNumber, otp) => {
  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

    if (!serviceSid || serviceSid === "") {
      throw new Error(
        "TWILIO_VERIFY_SERVICE_SID is not configured. Please create a Verify Service in Twilio Console and add the Service SID to .env file"
      );
    }

    const client = getTwilioClient();

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    return { success: true, sid: verification.sid };
  } catch (error) {
    if (error.code === 60200 || error.message.includes("sid")) {
      throw new Error(
        "Twilio Verify Service SID is invalid. Please check TWILIO_VERIFY_SERVICE_SID in .env file"
      );
    }
    throw new Error(`SMS sending failed: ${error.message}`);
  }
};

export const verifyOTPCode = async (phoneNumber, otp) => {
  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

    if (!serviceSid || serviceSid === "") {
      return {
        valid: false,
        status: "error",
        message: "TWILIO_VERIFY_SERVICE_SID is not configured",
      };
    }

    const client = getTwilioClient();

    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });

    return {
      valid: verificationCheck.status === "approved",
      status: verificationCheck.status,
    };
  } catch (error) {
    return {
      valid: false,
      status: "error",
      message: error.message,
    };
  }
};
