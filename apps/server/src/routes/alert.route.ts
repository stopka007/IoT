import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import Alert from "../models/alert.model";
import { asyncHandler } from "../utils/errorUtils";
import { ApiError } from "../utils/errors";

export default async function (server: FastifyInstance) {
  // GET /alerts - List all alerts
  server.get(
    "/",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { status, deviceId } = request.query as { status?: string; deviceId?: string };

      // If status=open is provided, return only open alerts
      if (status === "open") {
        const openAlerts = await Alert.find({ status: "open" });
        return reply.send(openAlerts);
      }

      // If deviceId is provided, filter by device ID
      if (deviceId) {
        const deviceAlerts = await Alert.find({ id_device: deviceId });
        return reply.send(deviceAlerts);
      }

      // Default: return all alerts
      const alerts = await Alert.find();
      reply.send(alerts);
    }),
  );

  // Delete alerts
  server.delete(
    "/delete",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const alerts = await Alert.deleteMany();
      reply.send(alerts);
    }),
  );

  // POST /alerts - Create a new alert (SOS notification)
  server.post(
    "/",
    asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const alert = await Alert.create(request.body);
      reply.code(201).send(alert);
    }),
  );

  // PATCH /alerts/:id/resolve - Mark an alert as resolved
  type AlertResolveParams = { Params: { id: string } };

  server.patch<AlertResolveParams>(
    "/:id/resolve",
    asyncHandler(async (request: FastifyRequest<AlertResolveParams>, reply: FastifyReply) => {
      const updated = await Alert.findByIdAndUpdate(
        request.params.id,
        { status: "resolved" },
        { new: true, runValidators: true },
      );

      if (!updated) {
        throw ApiError.notFound("Alert not found");
      }

      reply.send(updated);
    }),
  );
}
