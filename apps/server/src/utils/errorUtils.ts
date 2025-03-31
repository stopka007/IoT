import { FastifyReply, FastifyRequest } from "fastify";

import { ApiError } from "./errors";

/**
 * Wraps an async route handler with error handling
 * This is an alternative to try-catch blocks in every route
 */
export const asyncHandler = (handler: Function) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      return await handler(req, reply);
    } catch (error) {
      // Let the global error handler deal with it
      throw error instanceof ApiError ? error : ApiError.fromError(error);
    }
  };
};

/**
 * Helper to check if a resource exists and throw a 404 if not
 */
export const checkResourceExists = (resource: any, message: string = "Resource not found") => {
  if (!resource) {
    throw ApiError.notFound(message);
  }
  return resource;
};

/**
 * Utility for handling mongoose validation errors specifically
 */
export const handleMongooseError = (error: any) => {
  // Check if it's a Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    throw ApiError.badRequest(messages.join(", "), error);
  }

  // Check if it's a duplicate key error
  if (error.code === 11000) {
    throw ApiError.conflict("Duplicate key error", error);
  }

  // For other mongoose errors
  throw ApiError.fromError(error);
};
