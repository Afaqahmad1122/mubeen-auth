import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";
import connectDB from "./src/config/database.js";
import errorHandler from "./src/middleware/errorHandler.js";
import userRoutes from "./src/routes/userRoutes.js";
import otpRoutes from "./src/routes/otpRoutes.js";
import { apiLimiter, corsOptions } from "./src/config/security.js";

// Load env vars
dotenv.config();

// Initialize express app
const app = express();

// Security middleware (must be first)
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Request logging only in deve
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Rate limiting
app.use("/api/", apiLimiter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Check if the server is running
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Connect to database and start server
const PORT = process.env.PORT || 3000;

const server = connectDB()
  .then(() => {
    const httpServer = app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    return httpServer;
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

export default app;
