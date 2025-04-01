import { FastifyInstance } from "fastify";
import { Device } from "../models/device.model";
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
  server.patch<{ Params: { id: string }; Body: Partial<typeof Device.prototype> }>("/:id", async (request, reply) => {
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
});

// Update only help_needed
server.patch<{ Params: { id: string }; Body: { help_needed: boolean } }>("/:id/help", async (request, reply) => {
  try {
    const device = await Device.findByIdAndUpdate(
      request.params.id,
      { help_needed: request.body.help_needed },
      { new: true, runValidators: true }
    );
    if (!device) throw ApiError.notFound("Device not found");
    reply.send(device);
  } catch (error) {
    throw ApiError.badRequest("Failed to update help status", error);
  }
});

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
}