import dotenv from "dotenv";
import { FastifyInstance } from "fastify";
import fs from "fs";
import mongoose from "mongoose";

import { buildServer } from "../server";

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

let app: FastifyInstance;

export async function setupTestServer() {
  if (!app) {
    app = await buildServer();
  }
  return app;
}

export async function setupTestDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
  }
  // Wait for connection to be ready
  while (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function teardownTestDatabase() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

export async function teardownTestServer() {
  if (app) {
    await app.close();
  }
}
