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
  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "username", "password"],
          properties: {
            email: { type: "string", format: "email" },
            username: { type: "string", minLength: 1 },
            password: {
              type: "string",
              pattern: passwordRegex.source,
              errorMessage: {
                pattern:
                  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateUserRequestBody }>, reply: FastifyReply) => {
      const { email, username, password } = request.body;

      try {
        // No need for pre-check, let the save operation handle uniqueness via db index
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
          email,
          username,
          password: hashedPassword,
          role: "user", // Force role to 'user' regardless of input
        });

        await newUser.save(); // This will throw error if email/username is not unique

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return reply.status(201).send(userResponse);
      } catch (error: any) {
        fastify.log.error(error, "Error creating user");

        // Handle Mongoose duplicate key errors (for email/username uniqueness)
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          throw ApiError.conflict(`An account with that ${field} already exists.`);
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map((el: any) => el.message);
          const errorMessage = messages.join(", ");
          throw ApiError.badRequest(`Validation Error: ${errorMessage}`, error);
        }

        // Let the central handler deal with unexpected errors
        throw error;
      }
    },
  );

  // TODO: Add other user routes (GET, PUT, DELETE etc.)
}

export default userRoutes;
