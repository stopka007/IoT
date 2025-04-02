import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Room from '../models/room.model';
import { ApiError } from '../utils/errors';
import { IRoom } from '../models/room.model';

export default async function (server: FastifyInstance) {
  // POST /rooms
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;

    if (!body?.name || !body?.patient?.name || !body?.patient?.id) {
      throw ApiError.badRequest('Missing required fields');
    }

    const room = await Room.create(body);
    reply.code(201).send(room);
  });

  // GET /rooms
  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, patientName } = request.query as { name?: string; patientName?: string };

    const query: any = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (patientName) query['patient.name'] = { $regex: patientName, $options: 'i' };

    const rooms = await Room.find(query);
    reply.send(rooms);
  });

  // GET /rooms/:id
  server.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const room = await Room.findById(id);

    if (!room) throw ApiError.notFound('Room not found');
    reply.send(room);
  });

  // PATCH /rooms/:id
  server.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updated = await Room.findByIdAndUpdate(id, request.body as Partial<IRoom>, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw ApiError.notFound('Room not found');
    reply.send(updated);
  });

  // DELETE /rooms/:id
  server.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const deleted = await Room.findByIdAndDelete(id);

    if (!deleted) throw ApiError.notFound('Room not found');
    reply.send({ message: 'Room deleted' });
  });
}
