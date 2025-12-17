import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  // Return existing connection if already connected
  if (isConnected) {
    console.log("Using existing database connection");
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error("Database connection error:", error.message);
    isConnected = false;
    throw error;
  }
};

export default connectDB;
