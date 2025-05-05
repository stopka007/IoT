import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import mongoose from "mongoose";

import User from "../models/user.model";
import { buildServer } from "../server";

describe("Auth", () => {
  jest.setTimeout(60000);
  let app: FastifyInstance;
  const testUser = {
    email: "testuser@example.com",
    password: "Test1234!",
    role: "user",
    username: "testuser",
  };

  beforeAll(async () => {
    app = await buildServer();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!, {
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
      });
    }
    while (mongoose.connection.readyState !== 1) {
      await new Promise(res => setTimeout(res, 100));
    }
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await User.create({
      email: testUser.email,
      password: hashedPassword,
      role: testUser.role,
      username: testUser.username,
    });
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
    await mongoose.disconnect();
    await app.close();
  });

  it("should login successfully with correct credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: testUser.email,
        password: testUser.password,
      },
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("accessToken");
    expect(body).toHaveProperty("refreshToken");
  });

  it("should fail login with wrong password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: testUser.email,
        password: "WrongPassword",
      },
    });
    expect(response.statusCode).toBe(401);
  });

  it("should not access protected route without token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/me",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should access protected route with valid token", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: testUser.email,
        password: testUser.password,
      },
    });
    const { accessToken } = JSON.parse(loginRes.payload);
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.statusCode).toBe(200);
    const user = JSON.parse(response.payload);
    expect(user.email).toBe(testUser.email);
  });
});
