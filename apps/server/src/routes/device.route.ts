import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { Device } from "../models/device.model";
import { asyncHandler, checkResourceExists } from "../utils/errorUtils";
import { ApiError } from "../utils/errors";

export default async function (server: FastifyInstance) {
  // Create device
  server.post("/", async (request, reply) => {
    try {
      const device = await Device.create(request.body);
      reply.code(201).send(device);
    } catch (error) {
      throw ApiError.badRequest("Failed to create device", error);
    }
  });

  // Get all devices
  server.get("/", async (_request, reply) => {
    try {
      const devices = await Device.find();
      reply.send(devices);
    } catch (error) {
      throw ApiError.internal("Failed to fetch devices", error);
    }
  });

  // Get device by ID
  server.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    try {
      const device = await Device.findById(request.params.id);
      if (!device) throw ApiError.notFound("Device not found");
      reply.send(device);
    } catch (error) {
      throw ApiError.internal("Failed to fetch device", error);
    }
  });

  // Get device by device_id instead of mongo_id
  server.get<{ Params: { device_id: string } }>(
    "/device/:device_id",
    asyncHandler(
      async (request: FastifyRequest<{ Params: { device_id: string } }>, reply: FastifyReply) => {
        const { device_id } = request.params;

        if (!device_id || device_id.trim() === "") {
          throw ApiError.badRequest("Missing or empty device_id parameter");
        }

        const device = await Device.findOne({ id_device: device_id });
        checkResourceExists(device, `Device not found with id_device: ${device_id}`);

        reply.send(device);
      },
    ),
  );

  // Update device by device_id instead of mongo_id
  server.patch<{ Params: { device_id: string }; Body: Partial<typeof Device.prototype> }>(
    "/device/:device_id",
    asyncHandler(
      async (
        request: FastifyRequest<{
          Params: { device_id: string };
          Body: Partial<typeof Device.prototype>;
        }>,
        reply: FastifyReply,
      ) => {
        const { device_id } = request.params;

        if (!device_id || device_id.trim() === "") {
          throw ApiError.badRequest("Missing or empty device_id parameter");
        }

        const device = await Device.findOneAndUpdate({ id_device: device_id }, request.body, {
          new: true,
          runValidators: true,
        });

        checkResourceExists(device, `Device not found with id_device: ${device_id}`);

        reply.send(device);
      },
    ),
  );

  // Update device by MongoDB ID
  server.patch<{ Params: { id: string }; Body: Partial<typeof Device.prototype> }>(
    "/:id",
    async (request, reply) => {
      try {
        const device = await Device.findByIdAndUpdate(request.params.id, request.body, {
          new: true,
          runValidators: true,
        });
        if (!device) throw ApiError.notFound("Device not found");
        reply.send(device);
      } catch (error) {
        throw ApiError.badRequest("Failed to update device", error);
      }
    },
  );

  // Update only help_needed
  server.patch<{ Params: { id: string }; Body: { help_needed: boolean } }>(
    "/:id/help",
    async (request, reply) => {
      try {
        const device = await Device.findByIdAndUpdate(
          request.params.id,
          { help_needed: request.body.help_needed },
          { new: true, runValidators: true },
        );
        if (!device) throw ApiError.notFound("Device not found");
        reply.send(device);
      } catch (error) {
        throw ApiError.badRequest("Failed to update help status", error);
      }
    },
  );

  // Update only help_needed by device_id
  server.patch<{ Params: { device_id: string }; Body: { help_needed: boolean } }>(
    "/device/:device_id/help",
    asyncHandler(
      async (
        request: FastifyRequest<{
          Params: { device_id: string };
          Body: { help_needed: boolean };
        }>,
        reply: FastifyReply,
      ) => {
        const { device_id } = request.params;

        if (!device_id || device_id.trim() === "") {
          throw ApiError.badRequest("Missing or empty device_id parameter");
        }

        const device = await Device.findOneAndUpdate(
          { id_device: device_id },
          { help_needed: request.body.help_needed },
          { new: true, runValidators: true },
        );

        checkResourceExists(device, `Device not found with id_device: ${device_id}`);

        reply.send(device);
      },
    ),
  );

  // Get battery + help status
  server.get<{ Params: { id: string } }>("/:id/status", async (request, reply) => {
    try {
      const device = await Device.findById(request.params.id).select("battery_level help_needed");
      if (!device) throw ApiError.notFound("Device not found");
      reply.send(device);
    } catch (error) {
      throw ApiError.internal("Failed to fetch device status", error);
    }
  });

  // Get battery + help status by device_id
  server.get<{ Params: { device_id: string } }>(
    "/device/:device_id/status",
    asyncHandler(
      async (request: FastifyRequest<{ Params: { device_id: string } }>, reply: FastifyReply) => {
        const { device_id } = request.params;

        if (!device_id || device_id.trim() === "") {
          throw ApiError.badRequest("Missing or empty device_id parameter");
        }

        const device = await Device.findOne({ id_device: device_id }).select(
          "battery_level help_needed",
        );

        checkResourceExists(device, `Device not found with id_device: ${device_id}`);

        reply.send(device);
      },
    ),
  );

  // Delete device
  server.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    try {
      const result = await Device.findByIdAndDelete(request.params.id);
      if (!result) throw ApiError.notFound("Device not found");
      reply.send({ message: "Device deleted" });
    } catch (error) {
      throw ApiError.internal("Failed to delete device", error);
    }
  });

  // Delete device by device_id
  server.delete<{ Params: { device_id: string } }>(
    "/device/:device_id",
    asyncHandler(
      async (request: FastifyRequest<{ Params: { device_id: string } }>, reply: FastifyReply) => {
        const { device_id } = request.params;

        if (!device_id || device_id.trim() === "") {
          throw ApiError.badRequest("Missing or empty device_id parameter");
        }

        const device = await Device.findOneAndDelete({ id_device: device_id });
        checkResourceExists(device, `Device not found with id_device: ${device_id}`);

        reply.send({ message: "Device deleted" });
      },
    ),
  );

  // GET /devices/battery/:id_device - Get battery level for a device
  server.get<{ Params: { id_device: string } }>(
    "/battery/:id_device",
    asyncHandler(
      async (request: FastifyRequest<{ Params: { id_device: string } }>, reply: FastifyReply) => {
        const { id_device } = request.params;

        // Find the device
        const device = await Device.findOne({ id_device }).select("battery_level id_device");
        if (!device) {
          throw ApiError.notFound(`Device not found with id: ${id_device}`);
        }

        // Return battery level and device ID
        reply.send({
          battery_level: device.battery_level,
          id_device: device.id_device,
        });
      },
    ),
  );
}
