import { FastifyInstance } from 'fastify';
import Patient from '../models/patient.model';

export default async function (server: FastifyInstance) {
  // Create patient
  server.post('/', async (request, reply) => {
    try {
      const patient = await Patient.create(request.body);
      reply.code(201).send(patient);
    } catch (error) {
      reply.code(400).send({ message: 'Failed to create patient', error });
    }
  });

  // Get all patients
  server.get('/', async (_request, reply) => {
    try {
      const patients = await Patient.find();
      reply.send(patients);
    } catch (error) {
      reply.code(500).send({ message: 'Failed to fetch patients', error });
    }
  });

  // Get patient by ID
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const patient = await Patient.findById(request.params.id);
      if (!patient) return reply.code(404).send({ message: 'Patient not found' });
      reply.send(patient);
    } catch (error) {
      reply.code(500).send({ message: 'Failed to fetch patient', error });
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
}>('/:id', async (request, reply) => {
  try {
    const updated = await Patient.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return reply.code(404).send({ message: 'Patient not found' });
    }

    reply.send(updated);
  } catch (error) {
    reply.code(400).send({ message: 'Failed to update patient', error });
  }
});

  // Delete patient
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const deleted = await Patient.findByIdAndDelete(request.params.id);
      if (!deleted) return reply.code(404).send({ message: 'Patient not found' });
      reply.send({ message: 'Patient deleted' });
    } catch (error) {
      reply.code(500).send({ message: 'Failed to delete patient', error });
    }
  });
}
