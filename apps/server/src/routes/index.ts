import { FastifyInstance } from "fastify";

import exampleRoutes from "./example.route";
import patientRoutes from "./patient.route";

export const registerRoutes = (server: FastifyInstance) => {
  server.register(patientRoutes, { prefix: "/api/patients" });
  server.register(exampleRoutes, { prefix: "/api/examples" });
};
