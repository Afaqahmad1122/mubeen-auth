import mongoose from "mongoose";
import { IMAGE_CONSTRAINTS } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    interestedIn: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    hometown: {
      type: String,
      required: true,
      trim: true,
    },
    height: {
      type: Number,
      required: true,
    },
    religion: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    ethnicity: {
      type: String,
      required: true,
      trim: true,
    },
    schoolName: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    socialHandle: {
      type: String,
      trim: true,
    },
    socialHandlePlatform: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    drinking: {
      type: String,
      required: true,
      trim: true,
    },
    smoking: {
      type: String,
      required: true,
      trim: true,
    },
    iceBreakers: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length === 3;
        },
        message: "Exactly 3 ice breakers are required",
      },
    },
    politicalAffiliation: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return (
            v.length >= IMAGE_CONSTRAINTS.MIN &&
            v.length <= IMAGE_CONSTRAINTS.MAX
          );
        },
        message: `Images must be between ${IMAGE_CONSTRAINTS.MIN} and ${IMAGE_CONSTRAINTS.MAX}`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });

export default mongoose.model("User", userSchema);
