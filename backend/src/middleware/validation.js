import {
  isValidEmail,
  isValidDate,
  isAdult,
  validateImages,
  validateGender,
  validateInterestedIn,
  validateSocialPlatform,
  validateDrinking,
  validateSmoking,
  validatePoliticalAffiliation,
} from "../utils/validators.js";
import { IMAGE_CONSTRAINTS } from "../config/constants.js";
import { sendError } from "../utils/response.js";

export const validateUserRegistration = (req, res, next) => {
  const {
    gender,
    interestedIn,
    dob,
    hometown,
    height,
    religion,
    language,
    ethnicity,
    schoolName,
    education,
    jobTitle,
    companyName,
    fullName,
    socialHandle,
    socialHandlePlatform,
    email,
    drinking,
    smoking,
    iceBreakers1,
    iceBreakers2,
    iceBreakers3,
    politicalAffiliation,
    images,
  } = req.body;

  const errors = [];

  // Required fields validation
  if (!gender || !validateGender(gender)) {
    errors.push("Valid gender is required");
  }

  if (!interestedIn || !validateInterestedIn(interestedIn)) {
    errors.push("Valid interestedIn is required");
  }

  if (!dob || !isValidDate(dob) || !isAdult(dob)) {
    errors.push("Valid date of birth (must be 18+) is required");
  }

  if (!hometown || hometown.trim().length === 0) {
    errors.push("Hometown is required");
  }

  if (!height || typeof height !== "number" || height <= 0) {
    errors.push("Valid height is required");
  }

  if (!religion || religion.trim().length === 0) {
    errors.push("Religion is required");
  }

  if (!language || language.trim().length === 0) {
    errors.push("Language is required");
  }

  if (!ethnicity || ethnicity.trim().length === 0) {
    errors.push("Ethnicity is required");
  }

  if (!education || education.trim().length === 0) {
    errors.push("Education is required");
  }

  if (!fullName || fullName.trim().length === 0) {
    errors.push("Full name is required");
  }

  if (!email || !isValidEmail(email)) {
    errors.push("Valid email is required");
  }

  if (!drinking || !validateDrinking(drinking)) {
    errors.push("Valid drinking option is required");
  }

  if (!smoking || !validateSmoking(smoking)) {
    errors.push("Valid smoking option is required");
  }

  if (!iceBreakers1 || !iceBreakers2 || !iceBreakers3) {
    errors.push("All three ice breakers are required");
  }

  // Images validation
  if (!images || !validateImages(images)) {
    errors.push(
      `Images must be between ${IMAGE_CONSTRAINTS.MIN} and ${IMAGE_CONSTRAINTS.MAX}`
    );
  }

  if (
    socialHandle &&
    socialHandlePlatform &&
    !validateSocialPlatform(socialHandlePlatform)
  ) {
    errors.push("Valid social handle platform is required");
  }

  if (
    politicalAffiliation &&
    !validatePoliticalAffiliation(politicalAffiliation)
  ) {
    errors.push("Valid political affiliation is required");
  }

  if (errors.length > 0) {
    return sendError(res, errors.join(", "), 400);
  }

  // Transform ice breakers into array
  req.body.iceBreakers = [iceBreakers1, iceBreakers2, iceBreakers3];

  next();
};
