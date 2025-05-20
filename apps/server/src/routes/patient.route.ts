import { Static, Type } from "@sinclair/typebox";

import { FastifyInstance, FastifyRequest } from "fastify";

import { authenticate } from "../middleware/auth.middleware";
import ArchivedPatient from "../models/archivedPatient.model";
import { Device } from "../models/device.model";
import Patient, { IPatient } from "../models/patient.model";
// Make sure you import your Device model
// Assuming IPatient is exported
import { ApiError } from "../utils/errors";

// Import Typebox

// --- Define Schemas and Types ---

// Params for routes needing an ID
const ParamsSchema = Type.Object({
  id: Type.String({
    description: "MongoDB ObjectId for the patient",
    pattern: "^[0-9a-fA-F]{24}$",
  }), // Added ObjectId pattern
});
type ParamsType = Static<typeof ParamsSchema>;

// Base patient properties (adjust required/optional based on IPatient)
const PatientBaseSchema = Type.Object({
  id_patient: Type.String(),
  id_device: Type.Optional(Type.String()),
  name: Type.String(),
  room: Type.Optional(Type.Number()),
  illness: Type.Optional(Type.String()),
  age: Type.Optional(Type.Number()),
  status: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  battery_level: Type.Optional(Type.Number()),
  // Add other required/optional fields from IPatient here
});

// Body for creating a patient
const CreatePatientBodySchema = PatientBaseSchema; // Use the base schema
type CreatePatientBodyType = Static<typeof CreatePatientBodySchema>;

// Body for updating a patient (all fields optional, cannot update certain fields)
const UpdatePatientBodySchema = Type.Partial(
  Type.Omit(PatientBaseSchema, ["id_patient"]),
  // Remove only id_patient, allow id_device and battery_level
);
type UpdatePatientBodyType = Static<typeof UpdatePatientBodySchema>;

// Querystring for GET /
const GetPatientsQuerySchema = Type.Object({
  name: Type.Optional(Type.String()),
  room: Type.Optional(Type.Number()),
  minBattery: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
  maxBattery: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
  sortBy: Type.Optional(Type.Enum({ name: "name", room: "room", battery: "battery" })), // Use Typebox Enum
  sortOrder: Type.Optional(Type.Enum({ asc: "asc", desc: "desc" })), // Fixed: Define enum values
  page: Type.Integer({ minimum: 1, default: 1 }),
  limit: Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
});
type GetPatientsQueryType = Static<typeof GetPatientsQuerySchema>;

// --- Route Definitions ---

export default async function (server: FastifyInstance) {
  // Create patient - PROTECTED & ADMIN ONLY
  server.post<{ Body: CreatePatientBodyType }>( // Keep type assertion
    "/",
    {
      schema: { body: CreatePatientBodySchema }, // Apply schema
      preHandler: [authenticate],
    },
    async (request, reply) => {
      // Role check remains...
      if (!request.user || request.user.role !== "admin") {
        throw ApiError.forbidden("Admin permission required to create patients.");
      }
      try {
        // request.body is now correctly typed by Fastify + Typebox
        const patient = await Patient.create(request.body);
        reply.code(201).send(patient);
      } catch (error) {
        server.log.error(error, "Error creating patient");
        throw ApiError.badRequest("Failed to create patient", error);
      }
    },
  );

  // Get all patients - PROTECTED
  server.get<{ Querystring: GetPatientsQueryType }>(
    "/",
    {
      schema: { querystring: GetPatientsQuerySchema },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const query = request.query;

      if (
        query.minBattery !== undefined &&
        query.maxBattery !== undefined &&
        query.minBattery > query.maxBattery
      ) {
        throw ApiError.badRequest("minBattery cannot be greater than maxBattery.");
      }

      try {
        const skip = (query.page - 1) * query.limit;
        const lookupStage = {
          $lookup: {
            from: "devices",
            localField: "id_device",
            foreignField: "id_device",
            as: "deviceInfo",
          },
        };
        const unwindStage = { $unwind: { path: "$deviceInfo", preserveNullAndEmptyArrays: true } };
        const projectStage = {
          $project: {
            _id: 1,
            id_patient: 1,
            id_device: 1,
            name: 1,
            room: 1,
            illness: 1,
            age: 1,
            status: 1,
            notes: 1,
            battery_level: "$deviceInfo.battery_level",
          },
        };
        const matchFilter: any = {};
        if (query.name) {
          matchFilter.name = { $regex: query.name, $options: "i" };
        }
        if (query.room !== undefined) {
          matchFilter.room = query.room;
        }
        if (query.minBattery !== undefined) {
          matchFilter["deviceInfo.battery_level"] = {
            ...matchFilter["deviceInfo.battery_level"],
            $gte: query.minBattery,
          };
        }
        if (query.maxBattery !== undefined) {
          matchFilter["deviceInfo.battery_level"] = {
            ...matchFilter["deviceInfo.battery_level"],
            $lte: query.maxBattery,
          };
        }
        const matchStage = Object.keys(matchFilter).length > 0 ? { $match: matchFilter } : null;
        let sortStage: any;
        const sortCriteria: any = {};
        if (query.sortBy) {
          let sortField = query.sortBy === "battery" ? "deviceInfo.battery_level" : query.sortBy;
          sortCriteria[sortField] = query.sortOrder === "desc" ? -1 : 1;
          sortStage = { $sort: sortCriteria };
        } else {
          sortStage = { $sort: { name: 1 } };
        }
        const corePipeline = [lookupStage, unwindStage, ...(matchStage ? [matchStage] : [])];
        const results = await Patient.aggregate([
          ...corePipeline,
          {
            $facet: {
              metadata: [{ $count: "totalCount" }],
              data: [sortStage, { $skip: skip }, { $limit: query.limit }, projectStage],
            },
          },
        ]);
        const patients = results[0]?.data || [];
        const totalCount = results[0]?.metadata[0]?.totalCount || 0;
        const totalPages = Math.ceil(totalCount / query.limit);
        reply.send({
          data: patients,
          pagination: { totalCount, totalPages, currentPage: query.page, limit: query.limit },
        });
      } catch (error) {
        server.log.error(error, "Error fetching or aggregating patients");
        throw ApiError.internal("Failed to fetch patients", error);
      }
    },
  );

  // Get patient by ID - PROTECTED
  server.get<{ Params: ParamsType }>(
    "/:id",
    {
      schema: { params: ParamsSchema },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const patient = await Patient.findById(request.params.id);
        if (!patient) throw ApiError.notFound("Patient not found");
        reply.send(patient);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        server.log.error(error, "Error fetching patient");
        throw ApiError.internal("Failed to fetch patient", error);
      }
    },
  );

  // Get patient by id_patient - PROTECTED
  server.get<{ Params: { id_patient: string } }>(
    "/by-id-patient/:id_patient",
    {
      schema: {
        params: Type.Object({
          id_patient: Type.String(),
        }),
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const patient = await Patient.findOne({ id_patient: request.params.id_patient });
        if (!patient) throw ApiError.notFound("Patient not found");
        reply.send(patient);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        server.log.error(error, "Error fetching patient by id_patient");
        throw ApiError.internal("Failed to fetch patient", error);
      }
    },
  );

  // Update patient - PROTECTED (Admin or User)
  server.patch<{ Params: ParamsType; Body: UpdatePatientBodyType }>( // Keep type assertions
    "/:id",
    {
      schema: { params: ParamsSchema, body: UpdatePatientBodySchema }, // Apply schema
      preHandler: [authenticate],
    },
    async (request, reply) => {
      // request.params and request.body are now correctly typed
      const { id } = request.params;
      const updateData = request.body;

      // If assigning a device, also update battery_level from the device
      if (updateData.id_device) {
        const device = await Device.findOne({ id_device: updateData.id_device });
        if (device) {
          updateData.battery_level = device.battery_level;
        }
      }

      // Role check remains...
      if (!request.user || (request.user.role !== "admin" && request.user.role !== "user")) {
        throw ApiError.forbidden("Admin or User permission required to update patients.");
      }

      try {
        // updateData is now correctly typed, fixing the overload error
        const patient = await Patient.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
        if (!patient) {
          throw ApiError.notFound("Patient not found");
        }
        reply.send(patient);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        server.log.error(error, "Error updating patient");
        throw ApiError.internal("Failed to update patient", error);
      }
    },
  );

  // Delete patient - PROTECTED & ADMIN ONLY
  server.delete<{ Params: ParamsType }>( // Keep type assertion
    "/:id",
    {
      schema: { params: ParamsSchema }, // Apply schema
      preHandler: [authenticate],
    },
    async (request, reply) => {
      // request.params is now correctly typed

      // Role check remains...
      if (!request.user || request.user.role !== "admin") {
        throw ApiError.forbidden("Admin permission required to delete patients.");
      }
      try {
        const deleted = await Patient.findByIdAndDelete(request.params.id);
        if (!deleted) throw ApiError.notFound("Patient not found");
        reply.send({ message: "Patient deleted" });
      } catch (error) {
        if (error instanceof ApiError) throw error;
        server.log.error(error, "Error deleting patient");
        throw ApiError.internal("Failed to delete patient", error);
      }
    },
  );
}
