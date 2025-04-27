import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/errors";

// Extend FastifyRequest interface to include the user property
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      // User property is optional, might not be set if auth fails or isn't applied
      userId: string;
      role: string;
    };
  }
}

export const authenticate = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) => {
  try {
    // 1. Get token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication token missing or invalid format.");
    }
    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      request.log.error("JWT_SECRET is not configured for authentication middleware.");
      throw ApiError.internal("Server configuration error.");
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      role: string;
      iat: number;
      exp: number;
    };

    // 3. Attach user info to request
    request.user = { userId: decoded.userId, role: decoded.role };

    // 4. Proceed to the next handler/route
    done();
  } catch (error: any) {
    request.log.error(error, "Authentication error");
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      reply
        .status(401)
        .send(ApiError.unauthorized("Invalid or expired token.", error).jsonObject());
    } else if (error instanceof ApiError && error.statusCode === 401) {
      // Handle the specific unauthorized error we threw earlier
      reply.status(401).send(error.jsonObject());
    } else {
      // For other errors (like missing secret), let the default handler manage
      reply.status(500).send(ApiError.internal("Authentication failed.", error).jsonObject());
    }
    // Note: We explicitly send the reply here instead of throwing, as it's a Fastify hook
  }
};
