import express from "express";
import {
  registerUser,
  verifyRegistration,
} from "../controllers/userController.js";
import { validateUserRegistration } from "../middleware/validation.js";
import { registerLimiter } from "../config/security.js";

const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     description: Register a new user with 23 required fields including personal info, preferences, and images
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             gender: "male"
 *             interestedIn: "female"
 *             dob: "1995-05-15"
 *             hometown: "Lahore"
 *             height: 175
 *             religion: "Islam"
 *             language: "Urdu"
 *             ethnicity: "Pakistani"
 *             schoolName: "ABC High School"
 *             education: "Bachelor's Degree"
 *             jobTitle: "Software Engineer"
 *             companyName: "Tech Corp"
 *             fullName: "John Doe"
 *             socialHandle: "@johndoe"
 *             socialHandlePlatform: "instagram"
 *             email: "john.doe@example.com"
 *             drinking: "never"
 *             smoking: "never"
 *             iceBreakers1: "I love coding and building apps"
 *             iceBreakers2: "Coffee enthusiast and travel lover"
 *             iceBreakers3: "Always up for a good conversation"
 *             politicalAffiliation: "moderate"
 *             images:
 *               - "https://example.com/image1.jpg"
 *               - "https://example.com/image2.jpg"
 *               - "https://example.com/image3.jpg"
 *               - "https://example.com/image4.jpg"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 gender: "male"
 *                 email: "john.doe@example.com"
 *                 fullName: "John Doe"
 *                 createdAt: "2024-12-17T10:00:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Valid gender is required, Valid email is required"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "email already exists"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Too many registration attempts, please try again after an hour."
 */
router.post(
  "/register",
  registerLimiter,
  validateUserRegistration,
  registerUser
);

/**
 * @swagger
 * /api/users/verify-registration:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid OTP or validation error
 */
router.post("/verify-registration", registerLimiter, verifyRegistration);

export default router;
