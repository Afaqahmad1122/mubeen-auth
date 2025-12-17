import { verifyToken } from "../services/authService.js";
import { sendError } from "../utils/response.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authentication token required", 401);
    }

    const token = authHeader.substring(7);

    const result = await verifyToken(token);

    if (!result.valid) {
      return sendError(res, result.message, 401);
    }

    req.user = result.user;
    req.userId = result.userId;
    next();
  } catch (error) {
    return sendError(res, "Authentication failed", 401);
  }
};
