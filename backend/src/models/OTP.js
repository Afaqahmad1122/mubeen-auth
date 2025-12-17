import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    purpose: {
      type: String,
      enum: ["phone_verification", "email_verification", "registration"],
      default: "phone_verification",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ phoneNumber: 1, verified: 1 });
otpSchema.index({ email: 1, verified: 1 });
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("OTP", otpSchema);
