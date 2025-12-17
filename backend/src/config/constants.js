export const IMAGE_CONSTRAINTS = {
  MIN: 4,
  MAX: 6,
};

export const VALID_GENDERS = ["male", "female", "other"];

export const VALID_INTERESTED_IN = ["male", "female", "both"];

export const VALID_SOCIAL_PLATFORMS = [
  "instagram",
  "twitter",
  "facebook",
  "tiktok",
  "snapchat",
];

export const VALID_DRINKING_OPTIONS = ["never", "socially", "regularly"];

export const VALID_SMOKING_OPTIONS = ["never", "occasionally", "regularly"];

export const VALID_POLITICAL_AFFILIATIONS = [
  "liberal",
  "conservative",
  "moderate",
  "independent",
  "other",
];

export const OTP_CONFIG = {
  EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
  MAX_ATTEMPTS: 3,
  LENGTH: 6,
};
