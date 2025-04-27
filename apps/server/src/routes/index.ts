import { FastifyInstance } from "fastify";

import alertRoutes from "./alert.route";
import deviceRoutes from "./device.route";
import exampleRoutes from "./example.route";
import patientRoutes from "./patient.route";
import roomRoutes from "./room.route";
import userRoutes from "./user.route";

export const registerRoutes = (server: FastifyInstance) => {
  server.register(patientRoutes, { prefix: "/api/patients" });
  server.register(exampleRoutes, { prefix: "/api/examples" });
  server.register(alertRoutes, { prefix: "/api/alerts" });
  server.register(deviceRoutes, { prefix: "/api/devices" });
  server.register(roomRoutes, { prefix: "/api/rooms" });
  server.register(userRoutes, { prefix: "/api/users" });
};
