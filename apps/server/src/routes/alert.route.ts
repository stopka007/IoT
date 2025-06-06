import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import Alert from "../models/alert.model";
import { Device } from "../models/device.model";
import Patient from "../models/patient.model";
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
      alert.history.push({ status: "open", timestamp: alert.timestamp }); // Log creation in history
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
        { status: "Vyřešený", $push: { history: { status: "Vyřešený", timestamp: new Date() } } }, // Log resolution in history
        { new: true, runValidators: true },
      );

      if (!updated) {
        throw ApiError.notFound("Alert not found");
      }

      reply.send(updated);
    }),
  );

  // POST /alerts/create-with-device - Create alert and update device in one call
  interface CreateAlertWithDeviceBody {
    id_device: string;
    alertData?: Record<string, any>;
    deviceData?: {
      room?: number;
      id_patient?: string;
      battery_level?: number;
      help_needed?: boolean;
    };
  }

  server.post<{ Body: CreateAlertWithDeviceBody }>(
    "/create-with-device",
    asyncHandler(
      async (request: FastifyRequest<{ Body: CreateAlertWithDeviceBody }>, reply: FastifyReply) => {
        const { id_device, alertData = {}, deviceData = {} } = request.body;

        // 1. Find or create the device
        let device = await Device.findOne({ id_device });
        if (!device) {
          // Create new device if it doesn't exist
          device = await Device.create({
            id_device,
            ...deviceData,
          });
        }

        // 2. Find patient information if id_patient is provided
        let patientInfo = {};
        if (deviceData.id_patient) {
          const patient = await Patient.findOne({ id_patient: deviceData.id_patient });
          if (patient) {
            patientInfo = {
              patient_name: patient.name,
              patient_id: patient.id_patient,
            };
          }
        }

        // 3. Create the alert with initial history and patient info
        const alert = await Alert.create({
          id_device,
          ...patientInfo,
          ...alertData,
        });

        // Add creation to history
        alert.history.push({ status: "open", timestamp: alert.timestamp });
        await alert.save();

        // 4. Update the device with the alert reference
        const updatedDevice = await Device.findOneAndUpdate(
          { id_device },
          {
            alert: alert._id,
            ...deviceData, // Update any additional device data
          },
          { new: true },
        );

        // 5. Return both the alert and updated device
        reply.code(201).send({
          alert,
          device: updatedDevice,
        });
      },
    ),
  );

  // POST /alerts/resolve-with-device - Get device and resolve its alert
  interface ResolveAlertWithDeviceBody {
    id_device: string;
  }

  server.post<{ Body: ResolveAlertWithDeviceBody }>(
    "/resolve-with-device",
    asyncHandler(
      async (
        request: FastifyRequest<{ Body: ResolveAlertWithDeviceBody }>,
        reply: FastifyReply,
      ) => {
        const { id_device } = request.body;

        // 1. Find the device first
        const device = await Device.findOne({ id_device });
        if (!device) {
          throw ApiError.notFound(`Device not found with id: ${id_device}`);
        }

        // 2. Find and resolve the alert with history update
        const alert = await Alert.findOneAndUpdate(
          { id_device, status: "open" },
          {
            status: "Vyřešený",
            $push: {
              history: {
                status: "Vyřešený",
                timestamp: new Date(),
              },
            },
          },
          { new: true },
        );

        if (!alert) {
          throw ApiError.notFound(`No open alert found for device: ${id_device}`);
        }

        // 3. Update the device to clear the alert reference and help_needed
        const updatedDevice = await Device.findOneAndUpdate(
          { id_device },
          {
            alert: null,
          },
          { new: true },
        );

        // 4. Return both the alert and updated device
        reply.send({
          alert,
          device: updatedDevice,
        });
      },
    ),
  );

  // POST /alerts/update-battery - Update battery level and manage help_needed status
  interface UpdateBatteryBody {
    id_device: string;
    battery_level: number;
  }

  server.post<{ Body: UpdateBatteryBody }>(
    "/update-battery",
    asyncHandler(
      async (request: FastifyRequest<{ Body: UpdateBatteryBody }>, reply: FastifyReply) => {
        const { id_device, battery_level } = request.body;

        // 1. Find the device first
        const device = await Device.findOne({ id_device });
        if (!device) {
          throw ApiError.notFound(`Device not found with id: ${id_device}`);
        }

        // 2. Update device with new battery level and determine help_needed status
        const help_needed =
          battery_level < 30
            ? true
            : device.help_needed && battery_level >= 30
              ? false
              : device.help_needed;

        const updatedDevice = await Device.findOneAndUpdate(
          { id_device },
          {
            battery_level,
            help_needed,
          },
          { new: true },
        );

        // 3. Return the updated device
        reply.send({
          device: updatedDevice,
        });
      },
    ),
  );
}
