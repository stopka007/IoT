import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import ArchivedPatient from "../models/archivedPatient.model";

// adjust path as needed

export default async function (server: FastifyInstance) {
  server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const patients = await ArchivedPatient.find();
      reply.send({ data: patients });
    } catch (error) {
      reply.status(500).send({ error: "Failed to fetch archived patients" });
    }
  });

  server.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      if (!body.archivedAt) {
        body.archivedAt = new Date();
      }
      const archivedPatient = new ArchivedPatient(body);
      await archivedPatient.save();
      reply.code(201).send(archivedPatient);
    } catch (error) {
      reply.status(500).send({ error: "Failed to archive patient" });
    }
  });

  // Add the delete endpoint
  server.delete("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await ArchivedPatient.findByIdAndDelete(id);

      if (!result) {
        return reply.status(404).send({ error: "Archived patient not found" });
      }

      reply.send({ message: "Archived patient deleted successfully" });
    } catch (error) {
      reply.status(500).send({ error: "Failed to delete archived patient" });
    }
  });
}
