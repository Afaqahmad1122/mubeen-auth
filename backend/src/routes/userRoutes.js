import express from "express";
import { registerUser } from "../controllers/userController.js";
import { validateUserRegistration } from "../middleware/validation.js";
import { registerLimiter } from "../config/security.js";

const router = express.Router();

router.post(
  "/register",
  registerLimiter,
  validateUserRegistration,
  registerUser
);

export default router;
