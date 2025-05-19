import bcrypt from "bcrypt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

import { authenticate } from "../middleware/auth.middleware";
import User from "../models/user.model";
import { ApiError } from "../utils/errors";

// Copy password regex here (or move to shared util)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

interface LoginRequestBody {
  email: string;
  password: string;
}

interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

async function authRoutes(fastify: FastifyInstance) {
  // --- Explicit OPTIONS handler for /login ---
  fastify.options("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header("Access-Control-Allow-Origin", "*"); // Or your specific frontend origin
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    reply.header("Access-Control-Allow-Credentials", "true");
    return reply.status(204).send(); // 204 No Content is standard for preflight
  });

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

        // --- Generate JWTs (Access and Refresh) ---
        const jwtAccessSecret = process.env.JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        const jwtAccessExpiresIn = process.env.JWT_EXPIRES_IN;
        const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

        if (!jwtAccessSecret || !jwtRefreshSecret) {
          fastify.log.error("JWT secrets (JWT_SECRET, JWT_REFRESH_SECRET) are not configured.");
          throw ApiError.internal("Server configuration error.");
        }
        if (!jwtAccessExpiresIn || !jwtRefreshExpiresIn) {
          fastify.log.warn("JWT expiry times (JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN) not set.");
          // Consider throwing an error or setting defaults if expiry is mandatory
        }

        // Access Token Payload (can include roles, etc.)
        const accessPayload = {
          userId: user._id,
          role: user.role,
        };

        // Refresh Token Payload (keep minimal - just user identifier)
        const refreshPayload = {
          userId: user._id,
        };

        fastify.log.info({ accessPayload }, "Generating access token");
        const accessToken = jwt.sign(accessPayload, jwtAccessSecret, {
          expiresIn: jwtAccessExpiresIn, // e.g., '15m' or seconds
        });

        fastify.log.info({ refreshPayload }, "Generating refresh token");
        const refreshToken = jwt.sign(refreshPayload, jwtRefreshSecret, {
          expiresIn: jwtRefreshExpiresIn, // e.g., '7d' or seconds
        });

        // Send both tokens back to the client
        return reply.send({ accessToken, refreshToken });
      } catch (error: any) {
        // Log specific auth errors differently if needed, otherwise let default handler manage
        fastify.log.error(error, "Error during login");
        // Re-throw ApiError.unauthorized or other potential errors
        throw error;
      }
    },
  );

  // --- GET /api/auth/me --- Get Current Authenticated User ---
  fastify.get(
    "/me",
    {
      preHandler: [authenticate], // Requires user to be logged in
    },
    async (request, reply: FastifyReply) => {
      const requestingUser = request.user;

      if (!requestingUser) {
        // Should not happen if authenticate middleware works, but safeguard
        throw ApiError.unauthorized("Authentication required.");
      }

      try {
        // Fetch user details using the ID from the token payload (via middleware)
        const user = await User.findById(requestingUser.userId).select("-password");

        if (!user) {
          // User existed when token was created, but not anymore?
          throw ApiError.notFound("User associated with token not found.");
        }

        return reply.send(user);
      } catch (error: any) {
        fastify.log.error(error, "Error fetching current user (/me)");
        // Re-throw specific ApiErrors or let the central handler manage
        throw error;
      }
    },
  );

  // --- PATCH /api/auth/change-password --- Change authenticated user's password ---
  fastify.patch(
    "/change-password",
    {
      schema: {
        body: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string" }, // Just need presence
            newPassword: {
              type: "string",
              pattern: passwordRegex.source, // Apply complexity regex
            },
          },
        },
      },
      preHandler: [authenticate], // Requires user to be logged in
    },
    async (request, reply: FastifyReply) => {
      // Assert types inside
      const { currentPassword, newPassword } = request.body as ChangePasswordRequestBody;
      const requestingUser = request.user; // User info from authenticate middleware

      // Should always have user due to preHandler, but check for safety
      if (!requestingUser) {
        throw ApiError.unauthorized("Authentication required.");
      }

      try {
        // Fetch the current user, ensuring password field is included
        const user = await User.findById(requestingUser.userId).select("+password");

        // User should always exist if authenticated, but check just in case
        if (!user) {
          throw ApiError.notFound("User not found."); // Should technically not happen
        }

        // Verify the current password provided in the request body
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password || "");
        if (!isPasswordMatch) {
          throw ApiError.unauthorized("Incorrect current password.");
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password
        user.password = hashedNewPassword;
        await user.save(); // Mongoose validation (if any) runs here

        // Send success response (no body needed)
        return reply.status(204).send();
      } catch (error: any) {
        // Handle validation errors on new password (e.g., if schema had extra rules)
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map((el: any) => el.message);
          const errorMessage = messages.join(", ");
          throw ApiError.badRequest(`Validation Error: ${errorMessage}`, error);
        }
        fastify.log.error(error, "Error changing password");
        // Re-throw other errors (like ApiError.unauthorized or internal errors)
        throw error;
      }
    },
  );

  // --- POST /api/auth/refresh --- Refresh Access Token ---
  fastify.post(
    "/refresh",
    {
      schema: {
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) => {
      const { refreshToken } = request.body;
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      const jwtAccessSecret = process.env.JWT_SECRET; // Need this to sign new access token
      const jwtAccessExpiresIn = process.env.JWT_EXPIRES_IN;

      if (!jwtRefreshSecret || !jwtAccessSecret) {
        fastify.log.error("JWT secrets are not configured for refresh.");
        throw ApiError.internal("Server configuration error.");
      }

      try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: string };

        // Optional: Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
          throw ApiError.unauthorized("User not found for refresh token.");
        }

        // Generate a new access token
        const accessPayload = {
          userId: user._id,
          role: user.role,
        };
        const newAccessToken = jwt.sign(accessPayload, jwtAccessSecret, {
          expiresIn: jwtAccessExpiresIn,
        });

        return reply.send({ accessToken: newAccessToken });
      } catch (error: any) {
        fastify.log.error(error, "Error during token refresh");
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
          throw ApiError.unauthorized("Invalid or expired refresh token.");
        } else {
          throw ApiError.internal("Could not refresh token.");
        }
      }
    },
  );

  // TODO: Potentially add refresh token, logout routes later
}

export default authRoutes;
