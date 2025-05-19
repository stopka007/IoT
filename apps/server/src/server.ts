import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

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

  // CORS configuration with more flexible origin handling
  await server.register(cors, {
    origin: (origin, cb) => {
      const clientUrl = process.env.CLIENT_URL;
      server.log.info(`Request origin: ${origin}, CLIENT_URL: ${clientUrl}`);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return cb(null, true);

      // If CLIENT_URL is set, use it, otherwise accept all origins in development
      if (clientUrl) {
        // Handle multiple origins if needed
        const allowedOrigins = [clientUrl];

        // Check if the origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
          return cb(null, true);
        }

        // Add the specific frontend domain as fallback
        if (origin.includes("iot-frontend") && origin.includes("onrender.com")) {
          return cb(null, true);
        }

        server.log.warn(`CORS rejected origin: ${origin}`);
        return cb(null, false);
      } else {
        // In development or if CLIENT_URL is not set, accept all origins
        return cb(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
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
