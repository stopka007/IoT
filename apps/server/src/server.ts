import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import Fastify, { FastifyInstance } from 'fastify';

import { registerRoutes } from './routes';

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  // API documentation setup
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'API Documentation',
        description: 'API documentation for the Fastify server',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Register routes
  registerRoutes(server);

  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return server;
};
