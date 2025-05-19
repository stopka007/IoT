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
    origin: "https://iot-frontend-x8hz.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
