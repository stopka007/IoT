import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { asyncHandler } from "../utils/errorUtils";
import { ApiError } from "../utils/errors";

export default async function (server: FastifyInstance) {
  // Example route using asyncHandler - no try/catch needed
  server.get(
    "/",
    asyncHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
      const examples = [
        { id: 1, name: "Example 1" },
        { id: 2, name: "Example 2" },
      ];
      return reply.send(examples);
    }),
  );

  // Example route that demonstrates error throwing with ApiError
  server.get<{ Querystring: { error?: string } }>(
    "/error-demo",
    asyncHandler(
      async (request: FastifyRequest<{ Querystring: { error?: string } }>, reply: FastifyReply) => {
        const { error } = request.query;

        // Demonstrate different error types based on query parameter
        if (error === "not-found") {
          throw ApiError.notFound("Resource not found example");
        } else if (error === "bad-request") {
          throw ApiError.badRequest("Bad request example");
        } else if (error === "unauthorized") {
          throw ApiError.unauthorized("Unauthorized example");
        } else if (error === "forbidden") {
          throw ApiError.forbidden("Forbidden example");
        } else if (error === "conflict") {
          throw ApiError.conflict("Conflict example");
        } else if (error === "internal") {
          throw ApiError.internal("Internal server error example");
        }

        return reply.send({
          message: "No error triggered. Use ?error=TYPE to test error handling",
          availableErrors: [
            "not-found",
            "bad-request",
            "unauthorized",
            "forbidden",
            "conflict",
            "internal",
          ],
        });
      },
    ),
  );

  // Simulating a route that might throw an unexpected error
  server.get(
    "/unexpected-error",
    asyncHandler(async () => {
      // This will be caught by asyncHandler and converted to an ApiError
      throw new Error("This is an unexpected error");
    }),
  );
}
