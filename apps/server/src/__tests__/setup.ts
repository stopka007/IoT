import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.MONGODB_URI = "mongodb://localhost:27017/iot-test";
