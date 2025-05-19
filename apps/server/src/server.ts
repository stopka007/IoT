import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

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

  // Log environment variables for debugging
  server.log.info(
    {
      CLIENT_URL: process.env.CLIENT_URL,
      API_URL: process.env.API_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    "Environment configuration",
  );

  // CORS configuration
  await server.register(cors, {
    origin: ["https://iot-frontend-x8hz.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
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
    transformStaticCSP: (header: string) => header,
  });

  // Health check endpoints - register before other routes
  // Add to root path
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Also add to /api prefix for consistency
  server.get("/api/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Add a root route handler
  server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return { status: "ok", message: "IoT Backend API is running" };
  });

  server.setErrorHandler(errorHandler);
  registerRoutes(server);

  return server;
}
