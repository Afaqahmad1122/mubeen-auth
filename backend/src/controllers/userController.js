import * as userService from "../services/userService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const registerUser = async (req, res, next) => {
  try {
    // Check if user already exists
    const existingUser = await userService.getUserByEmail(req.body.email);
    if (existingUser) {
      return sendError(res, "User with this email already exists", 409);
    }

    const user = await userService.createUser(req.body);

    const userResponse = user.toObject();

    return sendSuccess(res, userResponse, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};
