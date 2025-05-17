import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";

if (fs.existsSync(".env.test")) {
  dotenv.config({ path: ".env.test" });
} else {
  console.warn(
    "[WARNING] .env.test file not found. Please copy .env.test.example and fill in the required values.",
  );
}

const requiredVars = ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables for tests: ${missingVars.join(", ")}`);
}

process.env.NODE_ENV = "test";

mongoose.set("bufferCommands", false);
