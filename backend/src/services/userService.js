import User from "../models/User.js";

export const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  return user;
};

export const getUserByPhoneNumber = async (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, "");
  let formattedPhone = null;

  if (cleaned.startsWith("92") && cleaned.length === 12) {
    formattedPhone = `+${cleaned}`;
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    formattedPhone = `+92${cleaned.substring(1)}`;
  } else if (cleaned.length === 10) {
    formattedPhone = `+92${cleaned}`;
  }

  if (!formattedPhone) {
    return null;
  }

  const user = await User.findOne({ phoneNumber: formattedPhone });
  return user;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};
