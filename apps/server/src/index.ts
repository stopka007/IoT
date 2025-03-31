import { buildServer } from './server';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
  const server = await buildServer();

  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    // Připoj DB před spuštěním serveru
    await connectDB();

    await server.listen({ port, host });

    console.log(`Server listening on ${host}:${port}`);

    const shutdown = async () => {
      console.log('Shutting down server...');
      await server.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
