import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Use MONGO_URI from environment variables, with a fallback to local MongoDB
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/iot";
    console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
