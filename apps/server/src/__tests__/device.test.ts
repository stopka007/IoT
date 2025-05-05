import { FastifyInstance } from "fastify";
import mongoose from "mongoose";

import { Device } from "../models/device.model";
import { buildServer } from "../server";

describe("Device CRUD", () => {
  jest.setTimeout(60000);
  let app: FastifyInstance;
  let createdDeviceId: string;
  let createdDeviceDeviceId: string = "test-device-123";

  const testDevice = {
    id_device: createdDeviceDeviceId,
    room: 101,
    id_patient: "patient-xyz",
    battery_level: 85,
    help_needed: false,
  };

  beforeAll(async () => {
    app = await buildServer();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!, {
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
      });
    }
    // Wait for mongoose connection to be ready
    while (mongoose.connection.readyState !== 1) {
      await new Promise(res => setTimeout(res, 100));
    }
    await Device.deleteMany({ id_device: createdDeviceDeviceId });
  });

  afterAll(async () => {
    await Device.deleteMany({ id_device: createdDeviceDeviceId });
    await mongoose.disconnect();
    await app.close();
  });

  it("should create a device", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/devices/",
      payload: testDevice,
    });
    expect(response.statusCode).toBe(201);
    const device = JSON.parse(response.payload);
    expect(device.id_device).toBe(testDevice.id_device);
    createdDeviceId = device._id;
  });

  it("should get all devices (should include the created device)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/devices/",
    });
    expect(response.statusCode).toBe(200);
    const devices = JSON.parse(response.payload);
    expect(Array.isArray(devices)).toBe(true);
    expect(devices.some((d: any) => d.id_device === testDevice.id_device)).toBe(true);
  });

  it("should get a device by Mongo ID", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/devices/${createdDeviceId}`,
    });
    expect(response.statusCode).toBe(200);
    const device = JSON.parse(response.payload);
    expect(device.id_device).toBe(testDevice.id_device);
  });

  it("should update a device by device_id", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/api/devices/device/${testDevice.id_device}`,
      payload: { battery_level: 50 },
    });
    expect(response.statusCode).toBe(200);
    const device = JSON.parse(response.payload);
    expect(device.battery_level).toBe(50);
  });

  it("should delete a device by device_id", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/api/devices/device/${testDevice.id_device}`,
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.message).toBe("Device deleted");
  });

  it("should return 400 for missing required fields", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/devices/",
      payload: { room: 101 },
    });
    expect(response.statusCode).toBe(400);
  });

  it("should return 404 for not found device", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/devices/device/nonexistent-device",
    });
    expect(response.statusCode).toBe(404);
  });
});
