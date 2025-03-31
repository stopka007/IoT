import { FastifyInstance } from 'fastify';
import patientRoutes from './patient.route';

export const registerRoutes = (server: FastifyInstance) => {
  server.register(patientRoutes, { prefix: '/api/patients' });
};
