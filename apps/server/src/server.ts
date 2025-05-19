import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import Fastify, { FastifyInstance } from "fastify";

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
  });

  await server.register(cors, {
    origin: true,
    credentials: true,
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

  // Minimal CORS test route for debugging
  server.options("/cors-test", (req, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
    reply.send();
  });

  server.get("/cors-test", (req, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.send({ ok: true });
  });

  return server;
}
