import { FastifyInstance } from "fastify";

import { buildServer } from "../server";

describe("Health Check", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 200 OK with status ok", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      status: "ok",
      timestamp: expect.any(String),
    });
  });
});
