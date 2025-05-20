import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import Patient from "../models/patient.model";
import Room from "../models/room.model";
import { IRoom } from "../models/room.model";
import { asyncHandler, checkResourceExists, handleMongooseError } from "../utils/errorUtils";
import { ApiError } from "../utils/errors";

// Type definitions for request parameters
interface RoomIdParams {
  id: string;
}

// Type definitions for query parameters
interface RoomQueryParams {
  name?: string;
  patientName?: string;
  isActive?: string;
  page?: string;
  limit?: string;
}

// Type definitions for the request body
interface CreateRoomBody {
  name: number;
  patient?: {
    name: string;
    id: string;
  };
  isActive?: boolean;
  capacity?: number;
}

// Validate MongoDB ID format
const validateMongoId = (id: string): void => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest("Invalid room ID format");
  }
};

export default async function (server: FastifyInstance) {
  // POST /rooms - Create a new room
  server.post(
    "/",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as CreateRoomBody;

      // Validate required fields
      if (!body?.name) {
        throw ApiError.badRequest("Room name is required");
      }

      // Create the room
      const room = await Room.create(body).catch(handleMongooseError);
      return reply.code(201).send(room);
    }),
  );

  // GET /rooms - Get all rooms with optional filtering
  server.get(
    "/",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const {
        name,
        patientName,
        isActive,
        page = "1",
        limit = "10",
      } = request.query as RoomQueryParams;

      // Build query
      const query: Record<string, any> = {};

      if (name) query.name = Number(name);
      if (patientName) query["patient.name"] = { $regex: patientName, $options: "i" };
      if (isActive !== undefined) query.isActive = isActive === "true";

      // Pagination - ensure positive values only
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100); // Limit max results to 100
      const skip = (pageNumber - 1) * limitNumber;

      // Execute query with pagination
      const [rooms, total] = await Promise.all([
        Room.find(query)
          .select("-__v") // Exclude version field
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
          .lean() // For better performance when not needed as full documents
          .exec(),
        Room.countDocuments(query),
      ]);

      // Return with pagination metadata
      return reply.send({
        data: rooms,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      });
    }),
  );

  // GET /rooms/:id - Get a single room by ID
  server.get(
    "/:id",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as RoomIdParams;
      validateMongoId(id);

      const room = await Room.findById(id).select("-__v").lean();
      checkResourceExists(room, "Room not found");

      return reply.send(room);
    }),
  );

  // PATCH /rooms/:id - Update a room
  server.patch(
    "/:id",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as RoomIdParams;
      const updates = request.body as Partial<IRoom>;

      validateMongoId(id);

      // Prevent empty updates
      if (!updates || Object.keys(updates).length === 0) {
        throw ApiError.badRequest("No update data provided");
      }

      const updated = await Room.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
        select: "-__v", // Exclude version field
      }).catch(handleMongooseError);

      checkResourceExists(updated, "Room not found");

      return reply.send(updated);
    }),
  );

  // DELETE /rooms/:id - Delete a room
  server.delete(
    "/:id",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as RoomIdParams;
      validateMongoId(id);

      // Najdi pokoj podle ID
      const deleted = await Room.findByIdAndDelete(id);
      checkResourceExists(deleted, "Room not found");

      // Pokud pokoj existoval, nastav room=null u všech pacientů, kteří byli v tomto pokoji
      if (deleted && deleted.name) {
        await Patient.updateMany({ room: deleted.name }, { $set: { room: null } });
      }

      return reply.send({ success: true, message: "Room deleted successfully" });
    }),
  );
}
