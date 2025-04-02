import { FastifyInstance } from "fastify";
import Patient from "../models/patient.model";
import { ApiError } from "../utils/errors";

export default async function (server: FastifyInstance) {
  // Create patient
  server.post("/", async (request, reply) => {
    try {
      const patient = await Patient.create(request.body);
      reply.code(201).send(patient);
    } catch (error) {
      throw ApiError.badRequest("Failed to create patient", error);
    }
  });

  // Get all patients
  server.get("/", async (_request, reply) => {
    try {
      const patients = await Patient.find();
      reply.send(patients);
    } catch (error) {
      throw ApiError.internal("Failed to fetch patients", error);
    }
  });

  // Get patient by ID
  server.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    try {
      const patient = await Patient.findById(request.params.id);
      if (!patient) throw ApiError.notFound("Patient not found");
      reply.send(patient);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal("Failed to fetch patient", error);
    }
  });

  // Update patient
  server.patch<{
    Params: { id: string };
    Body: Partial<{
      id_patient: string;
      id_device: string;
      name: string;
      room: number;
    }>;
  }>("/:id", async (request, reply) => {
    try {
      const updated = await Patient.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        throw ApiError.notFound("Patient not found");
      }

      reply.send(updated);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.badRequest("Failed to update patient", error);
    }
  });

  // Delete patient
  server.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    try {
      const deleted = await Patient.findByIdAndDelete(request.params.id);
      if (!deleted) throw ApiError.notFound("Patient not found");
      reply.send({ message: "Patient deleted" });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal("Failed to delete patient", error);
    }
  });
}
