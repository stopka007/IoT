import bcrypt from "bcrypt";
import { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from "fastify";

import { authenticate } from "../middleware/auth.middleware";
import User from "../models/user.model";
import { ApiError } from "../utils/errors";

// Define a type for the request body
interface CreateUserRequestBody {
  email: string;
  username: string;
  password: string;
}

// Regex for password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Define reusable options for protected routes requiring userId param
const protectedUserRouteOptions: RouteShorthandOptions = {
  schema: {
    params: {
      type: "object",
      properties: { userId: { type: "string" } },
      required: ["userId"],
    },
  },
  preHandler: [authenticate],
};

// Define the route handlers within a Fastify plugin
async function userRoutes(fastify: FastifyInstance) {
  // --- POST /api/users --- Create a new user ---
  fastify.post(
    "/",
    {
      schema: {
        // Add schema validation for the request body
        body: {
          type: "object",
          required: ["email", "username", "password"],
          properties: {
            email: { type: "string", format: "email" },
            username: { type: "string", minLength: 1 },
            password: {
              type: "string",
              pattern: passwordRegex.source, // Apply complexity regex
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateUserRequestBody }>, reply: FastifyReply) => {
      const { email, username, password } = request.body;

      try {
        // No need for pre-check, let the save operation handle uniqueness via db index
        const saltRounds = 10; // Standard salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user instance
        const newUser = new User({
          email,
          username,
          password: hashedPassword,
          role: "user", // Force role to 'user' regardless of input
        });

        // Attempt to save the user (Mongoose handles validation & uniqueness)
        await newUser.save(); // This will throw error if email/username is not unique

        // Prepare response object excluding the password
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return reply.status(201).send(userResponse); // 201 Created
      } catch (error: any) {
        fastify.log.error(error, "Error creating user");

        // Handle Mongoose duplicate key errors (for email/username uniqueness)
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0]; // Get the field that caused the duplicate error
          throw ApiError.conflict(`An account with that ${field} already exists.`);
        }

        // Handle Mongoose validation errors (e.g., required fields, email format)
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map((el: any) => el.message); // Extract messages
          const errorMessage = messages.join(", ");
          throw ApiError.badRequest(`Validation Error: ${errorMessage}`, error);
        }

        // Let the central handler deal with unexpected errors
        throw error;
      }
    },
  );

  // --- GET /api/users --- List all users ---
  fastify.get(
    "/",
    { preHandler: [authenticate] }, // Options just for this route
    async (request, reply: FastifyReply) => {
      const requestingUser = request.user; // User info from authenticate middleware

      // Authorization Check: Only admins can list all users
      if (!requestingUser || requestingUser.role !== "admin") {
        throw ApiError.forbidden("Insufficient permissions to list users.");
      }

      try {
        // Find all users, explicitly exclude the password field
        const users = await User.find({}).select("-password");
        return reply.send(users);
      } catch (error) {
        fastify.log.error(error, "Error fetching users");
        throw ApiError.internal("Failed to fetch users"); // Throw generic internal error for the handler
      }
    },
  );

  // --- GET /api/users/:userId --- Get a single user by ID ---
  fastify.get(
    "/:userId",
    protectedUserRouteOptions, // Use the shared options object
    async (request, reply: FastifyReply) => {
      const userId = (request.params as { userId: string }).userId;
      const requestingUser = request.user;

      // Authorization Check: Allow self or admin
      if (
        !requestingUser ||
        (requestingUser.role !== "admin" && requestingUser.userId !== userId)
      ) {
        throw ApiError.forbidden("Insufficient permissions to access this user.");
      }

      try {
        const user = await User.findById(userId).select("-password");

        if (!user) {
          throw ApiError.notFound("User not found"); // Throw 404 if user doesn't exist
        }

        return reply.send(user);
      } catch (error: any) {
        // Handle potential CastError if userId is not a valid ObjectId format
        if (error.name === "CastError" && error.path === "_id") {
          throw ApiError.badRequest("Invalid user ID format");
        }
        fastify.log.error(error, "Error fetching user by ID");
        // Re-throw other errors (like the ApiError.notFound or potential internal errors) for the central handler
        throw error;
      }
    },
  );

  // --- PATCH /api/users/:userId --- Update a user ---
  interface UpdateUserRequestBody {
    username?: string;
    email?: string;
    // Password and role changes are handled by separate endpoints
  }

  const patchUserOptions: RouteShorthandOptions = {
    ...protectedUserRouteOptions, // Inherit base options (params validation, auth)
    schema: {
      ...protectedUserRouteOptions.schema, // Inherit params schema
      body: {
        // Add body schema specific to PATCH
        type: "object",
        properties: {
          username: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
        },
      },
    },
  };
  fastify.patch(
    "/:userId",
    patchUserOptions, // Use the specific options for PATCH
    async (request, reply: FastifyReply) => {
      const userId = (request.params as { userId: string }).userId;
      const updateData = request.body as UpdateUserRequestBody;
      const requestingUser = request.user;

      // Authorization Check: Allow self or admin
      if (
        !requestingUser ||
        (requestingUser.role !== "admin" && requestingUser.userId !== userId)
      ) {
        throw ApiError.forbidden("Insufficient permissions to update this user.");
      }

      // Prevent empty update requests
      if (Object.keys(updateData).length === 0) {
        throw ApiError.badRequest("No update data provided.");
      }

      try {
        const user = await User.findById(userId);

        if (!user) {
          throw ApiError.notFound("User not found");
        }

        // Check for potential conflicts if email/username is being changed
        if (updateData.email && updateData.email !== user.email) {
          const existingEmail = await User.findOne({ email: updateData.email });
          if (existingEmail) {
            throw ApiError.conflict("An account with that email already exists.");
          }
          user.email = updateData.email;
        }
        if (updateData.username && updateData.username !== user.username) {
          const existingUsername = await User.findOne({ username: updateData.username });
          if (existingUsername) {
            throw ApiError.conflict("An account with that username already exists.");
          }
          user.username = updateData.username;
        }

        // Only save if there were actual changes to username or email
        if (user.isModified("email") || user.isModified("username")) {
          await user.save(); // This will also trigger validation rules from the schema
        }

        // Prepare response object excluding the password
        const userResponse = user.toObject();
        delete userResponse.password;

        return reply.send(userResponse);
      } catch (error: any) {
        // Handle potential CastError if userId is not a valid ObjectId format
        if (error.name === "CastError" && error.path === "_id") {
          throw ApiError.badRequest("Invalid user ID format");
        }
        // Handle Mongoose validation errors (e.g., email format if updated)
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map((el: any) => el.message);
          const errorMessage = messages.join(", ");
          throw ApiError.badRequest(`Validation Error: ${errorMessage}`, error);
        }
        fastify.log.error(error, "Error updating user");
        // Re-throw other errors (like ApiError.notFound, ApiError.conflict or potential internal errors)
        throw error;
      }
    },
  );

  // --- DELETE /api/users/:userId --- Delete a user ---
  fastify.delete(
    "/:userId",
    protectedUserRouteOptions, // Use the shared options object
    async (request, reply: FastifyReply) => {
      const userId = (request.params as { userId: string }).userId;
      const requestingUser = request.user;

      // Authorization Check: Allow self or admin
      if (
        !requestingUser ||
        (requestingUser.role !== "admin" && requestingUser.userId !== userId)
      ) {
        throw ApiError.forbidden("Insufficient permissions to delete this user.");
      }

      try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
          throw ApiError.notFound("User not found"); // Throw 404 if user didn't exist
        }

        // Successfully deleted
        // Option 1: Send 204 No Content (common practice for DELETE)
        return reply.status(204).send();

        // Option 2: Send 200 OK with a confirmation message (also fine)
        // return reply.send({ message: 'User deleted successfully' });
      } catch (error: any) {
        // Handle potential CastError if userId is not a valid ObjectId format
        if (error.name === "CastError" && error.path === "_id") {
          throw ApiError.badRequest("Invalid user ID format");
        }
        fastify.log.error(error, "Error deleting user");
        // Re-throw other errors (like ApiError.notFound or potential internal errors)
        throw error;
      }
    },
  );

  // --- PATCH /api/users/:userId/role --- Update a user's role (Admin only) ---
  interface UpdateUserRoleRequestBody {
    role: "admin" | "user";
  }
  // Define options specifically for the role update route
  const patchUserRoleOptions: RouteShorthandOptions = {
    ...protectedUserRouteOptions, // Inherit base options (params validation, auth)
    schema: {
      ...protectedUserRouteOptions.schema, // Inherit params schema
      body: {
        // Add body schema specific to Role PATCH
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: ["admin", "user"] },
        },
      },
    },
  };
  fastify.patch(
    "/:userId/role",
    patchUserRoleOptions, // Use the specific options for role update
    async (request, reply: FastifyReply) => {
      const targetUserId = (request.params as { userId: string }).userId;
      const newRole = (request.body as UpdateUserRoleRequestBody).role;
      const requestingUser = request.user;

      // Log the requesting user's details for debugging
      fastify.log.info({ requestingUser }, "Checking authorization for role change");

      try {
        // Authorization Check: Ensure the requesting user is an admin
        if (!requestingUser || requestingUser.role !== "admin") {
          throw ApiError.forbidden("Insufficient permissions to change user roles.");
        }

        // Prevent admin from accidentally changing their own role via this endpoint?
        // Optional: Add check if targetUserId === requestingUser.userId

        // Find the target user to update
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          throw ApiError.notFound("Target user not found.");
        }

        // Update the role and save
        targetUser.role = newRole;
        await targetUser.save(); // Mongoose validation applies

        // Prepare response (excluding password)
        const userResponse = targetUser.toObject();
        delete userResponse.password;

        return reply.send(userResponse);
      } catch (error: any) {
        // Handle known errors
        if (error.name === "CastError" && error.path === "_id") {
          throw ApiError.badRequest("Invalid target user ID format");
        }
        if (error.name === "ValidationError") {
          // Should not happen often with enum validation in schema
          throw ApiError.badRequest(`Validation Error: ${error.message}`, error);
        }
        // Log and re-throw other errors (including ApiError.forbidden, ApiError.notFound)
        fastify.log.error(error, "Error updating user role");
        throw error;
      }
    },
  );

  // TODO: Add auth routes (refresh, logout?)
}

export default userRoutes;
