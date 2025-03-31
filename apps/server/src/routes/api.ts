import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const apiRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
    handler: async () => {
      return {
        message: 'API is running',
        version: '1.0.0',
      };
    },
  });

  // Example resource endpoint
  fastify.get('/examples', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    handler: async () => {
      return [
        { id: 1, name: 'Example 1', createdAt: new Date().toISOString() },
        { id: 2, name: 'Example 2', createdAt: new Date().toISOString() },
      ];
    },
  });
};
