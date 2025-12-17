import express from "express";
import { requestOTP, verifyOTP } from "../controllers/otpController.js";
import { otpLimiter } from "../config/security.js";

const router = express.Router();

/**
 * @swagger
 * /api/otp/request:
 *   post:
 *     summary: Request OTP for phone verification
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+923001234567"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post("/request", otpLimiter, requestOTP);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+923001234567"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify", otpLimiter, verifyOTP);

export default router;
