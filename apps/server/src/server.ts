import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import session from "@fastify/session";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import connectRedis from "connect-redis";
import Fastify, { FastifyInstance } from "fastify";
import Redis from "ioredis";

import errorHandler from "./middleware/errorHandler";
import { registerRoutes } from "./routes";

export async function buildServer(): Promise<FastifyInstance> {
  const isProduction = process.env.NODE_ENV === "production";
  const server = Fastify({
    logger: isProduction
      ? true // Use default JSON logger in production
      : {
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          },
        },
    trustProxy: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await server.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Global wildcard OPTIONS handler
  server.options("/*", (request, reply) => {
    // Headers are mostly set by the @fastify/cors plugin globally,
    // but we ensure a 204 response for any unmatched OPTIONS.
    // The @fastify/cors plugin should have already added necessary ACAO, ACAM, ACAH headers.
    reply.status(204).send();
  });

  await server.register(rateLimit, {
    max: 1000,
    timeWindow: "1 minute",
  });

  await server.register(swagger, {
    openapi: {
      info: {
        title: "IoT API Documentation",
        description: "API for the IoT Application",
        version: "1.0.0",
      },
      servers: [
        {
          url: process.env.API_URL || "http://localhost:3000",
          description: "API server",
        },
      ],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: header => header,
  });

  server.setErrorHandler(errorHandler);
  registerRoutes(server);

  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  return server;
}
