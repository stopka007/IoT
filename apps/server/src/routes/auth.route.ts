import bcrypt from "bcrypt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

import User from "../models/user.model";
import { ApiError } from "../utils/errors";

interface LoginRequestBody {
  email: string;
  password: string;
}

async function authRoutes(fastify: FastifyInstance) {
  // --- POST /api/auth/login --- User Login ---
  fastify.post(
    "/login",
    {
      schema: {
        // Add schema validation for login body
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" }, // No complexity check needed here, just presence
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
      const { email, password } = request.body;

      try {
        // Find user by email, crucially selecting the password field which is excluded by default
        const user = await User.findOne({ email }).select("+password");

        // Security: Use the same error message for user not found or wrong password
        if (!user) {
          throw ApiError.unauthorized("Invalid credentials");
        }

        // Compare the provided password with the stored hash
        const isPasswordMatch = await bcrypt.compare(password, user.password || "");

        if (!isPasswordMatch) {
          throw ApiError.unauthorized("Invalid credentials");
        }

        // --- Generate JWT ---
        const jwtSecret = process.env.JWT_SECRET;
        // Get expiry time in seconds from .env
        const jwtExpiresInEnv = process.env.JWT_EXPIRES_IN;

        if (!jwtSecret) {
          fastify.log.error("JWT_SECRET is not configured.");
          throw ApiError.internal("Server configuration error.");
        }

        let expiresInSeconds: number | undefined;
        if (jwtExpiresInEnv) {
          expiresInSeconds = parseInt(jwtExpiresInEnv, 10);
          if (isNaN(expiresInSeconds)) {
            fastify.log.error(
              `Invalid JWT_EXPIRES_IN value: ${jwtExpiresInEnv}. Must be a number of seconds.`,
            );
            throw ApiError.internal("Server configuration error.");
          }
        } else {
          fastify.log.warn(
            "JWT_EXPIRES_IN not set, token will not expire unless library has default.",
          );
          // expiresInSeconds remains undefined - library might have a default or token won't expire
        }

        const payload = {
          userId: user._id,
          role: user.role,
        };

        // Log the payload before signing
        fastify.log.info({ payload }, "Generating token with payload");

        // Define options, conditionally add expiresIn if it was valid
        const signOptions: jwt.SignOptions = {};
        if (expiresInSeconds !== undefined) {
          signOptions.expiresIn = expiresInSeconds; // Assign the number
        }

        // Sign the token
        const token = jwt.sign(payload, jwtSecret, signOptions);

        // Send the token back to the client
        return reply.send({ token });
      } catch (error: any) {
        // Log specific auth errors differently if needed, otherwise let default handler manage
        fastify.log.error(error, "Error during login");
        // Re-throw ApiError.unauthorized or other potential errors
        throw error;
      }
    },
  );

  // TODO: Potentially add refresh token, logout routes later
}

export default authRoutes;
