import express from "express";
import { registerUser } from "../controllers/userController.js";
import { validateUserRegistration } from "../middleware/validation.js";

const router = express.Router();

router.post("/register", validateUserRegistration, registerUser);

export default router;
