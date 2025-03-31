import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

import { ApiError } from "../utils/errors";

export default function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send(error.jsonObject());
  }

  // Handle Fastify validation errors
  if (error.validation) {
    const apiError = ApiError.badRequest("Validation Error", error);
    return reply.status(apiError.statusCode).send(apiError.jsonObject());
  }

  // Handle other Fastify errors with statusCode
  if (error.statusCode) {
    const apiError = new ApiError(error.statusCode, error.message, error);
    return reply.status(apiError.statusCode).send(apiError.jsonObject());
  }

  // Default internal server error
  const apiError = ApiError.fromError(error);
  return reply.status(apiError.statusCode).send(apiError.jsonObject());
}
