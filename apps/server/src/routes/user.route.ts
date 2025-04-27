import bcrypt from "bcrypt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

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
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Find all users, explicitly exclude the password field
      const users = await User.find({}).select("-password");
      return reply.send(users);
    } catch (error) {
      fastify.log.error(error, "Error fetching users");
      throw ApiError.internal("Failed to fetch users"); // Throw generic internal error for the handler
    }
  });

  // --- GET /api/users/:userId --- Get a single user by ID ---
  fastify.get(
    "/:userId",
    {
      schema: {
        // Add schema validation for URL parameters
        params: {
          type: "object",
          properties: {
            userId: { type: "string" }, // Basic check, Mongoose will validate if it's a valid ObjectId format
          },
          required: ["userId"],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
      const { userId } = request.params;

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

}

export default userRoutes;
