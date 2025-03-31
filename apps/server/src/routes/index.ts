import { FastifyInstance } from 'fastify';

import { apiRoutes } from './api';

export function registerRoutes(server: FastifyInstance): void {
  server.register(apiRoutes, { prefix: '/api' });
}
