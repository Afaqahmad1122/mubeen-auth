import {
  IMAGE_CONSTRAINTS,
  VALID_GENDERS,
  VALID_INTERESTED_IN,
  VALID_SOCIAL_PLATFORMS,
  VALID_DRINKING_OPTIONS,
  VALID_SMOKING_OPTIONS,
  VALID_POLITICAL_AFFILIATIONS,
} from "../config/constants.js";

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const isAdult = (dateString) => {
  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

export const validateImages = (images) => {
  if (!Array.isArray(images)) return false;
  return (
    images.length >= IMAGE_CONSTRAINTS.MIN &&
    images.length <= IMAGE_CONSTRAINTS.MAX
  );
};

export const validateGender = (gender) => {
  return VALID_GENDERS.includes(gender?.toLowerCase());
};

export const validateInterestedIn = (interestedIn) => {
  return VALID_INTERESTED_IN.includes(interestedIn?.toLowerCase());
};

export const validateSocialPlatform = (platform) => {
  return !platform || VALID_SOCIAL_PLATFORMS.includes(platform?.toLowerCase());
};

export const validateDrinking = (drinking) => {
  return VALID_DRINKING_OPTIONS.includes(drinking?.toLowerCase());
};

export const validateSmoking = (smoking) => {
  return VALID_SMOKING_OPTIONS.includes(smoking?.toLowerCase());
};

export const validatePoliticalAffiliation = (affiliation) => {
  return (
    !affiliation ||
    VALID_POLITICAL_AFFILIATIONS.includes(affiliation?.toLowerCase())
  );
};
