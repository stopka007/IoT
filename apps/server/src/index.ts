import dotenv from "dotenv";

import { connectDB } from "./config/db";
import { buildServer } from "./server";

dotenv.config();

const start = async () => {
  const server = await buildServer();

  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || "0.0.0.0";

    // Připoj DB před spuštěním serveru
    await connectDB();

    await server.listen({ port, host });

    console.log(`Server listening on ${host}:${port}`);

    const shutdown = async () => {
      console.log("Shutting down server...");
      await server.close();
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    server.log.error(err);
  }
};

start();
