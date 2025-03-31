import { FastifyInstance } from 'fastify';
import Patient from '../models/patient.model';

export default async function (server: FastifyInstance) {
  server.post('/', async (request, reply) => {
    try {
      const patient = await Patient.create(request.body);
      reply.code(201).send(patient);
    } catch (error) {
      reply.code(400).send({ message: 'Failed to create patient', error });
    }
  });

  server.get('/', async (_request, reply) => {
    try {
      const patients = await Patient.find();
      reply.send(patients);
    } catch (error) {
      reply.code(500).send({ message: 'Failed to fetch patients', error });
    }
  });

  server.get('/:id', async (request, reply) => {
    try {
      // @ts-ignore
      const patient = await Patient.findById(request.params.id);
      if (!patient) return reply.code(404).send({ message: 'Patient not found' });
      reply.send(patient);
    } catch (error) {
      reply.code(500).send({ message: 'Failed to fetch patient', error });
    }
  });

  server.patch('/:id', async (request, reply) => {
    try {
      // @ts-ignore
      const updated = await Patient.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) return reply.code(404).send({ message: 'Patient not found' });
      reply.send(updated);
    } catch (error) {
      reply.code(400).send({ message: 'Failed to update patient', error });
    }
  });

  server.delete('/:id', async (request, reply) => {
    try {
      // @ts-ignore
      const deleted = await Patient.findByIdAndDelete(request.params.id);
      if (!deleted) return reply.code(404).send({ message: 'Patient not found' });
      reply.send({ message: 'Patient deleted' });
    } catch (error) {
      reply.code(500).send({ message: 'Failed to delete patient', error });
    }
  });
}
