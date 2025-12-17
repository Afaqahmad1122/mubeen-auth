import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ phoneNumber: 1, verified: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("OTP", otpSchema);
