import nodemailer from "nodemailer";
import { OTP_CONFIG } from "../config/constants.js";

let emailTransporter = null;

const getEmailTransporter = () => {
  if (emailTransporter) return emailTransporter;

  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = process.env.EMAIL_APP_PASSWORD?.trim();

  if (!emailUser || !emailPassword) {
    throw new Error("Email credentials are not configured");
  }

  emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5,
  });

  return emailTransporter;
};

const escapeHtml = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

export const sendOTPviaEmail = async (email, otp) => {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email address");
  }

  if (!otp || typeof otp !== "string" || otp.length !== OTP_CONFIG.LENGTH) {
    throw new Error("Invalid OTP format");
  }

  try {
    const transporter = getEmailTransporter();
    const safeOtp = escapeHtml(otp);
    const safeEmail = escapeHtml(email);

    const mailOptions = {
      from: process.env.EMAIL_USER?.trim(),
      to: safeEmail,
      subject: "Your OTP Code - Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p>Your OTP code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${safeOtp}</h1>
          </div>
          <p>This OTP is valid for ${OTP_CONFIG.EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};
