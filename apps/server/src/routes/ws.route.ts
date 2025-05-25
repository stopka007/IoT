import { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import { WebSocket } from "ws";
import "../types/fastify"; // vlastní typová rozšíření, pokud máš

let clients: Set<WebSocket> = new Set();

export default async function (server: FastifyInstance) {
  await server.register(websocket);

  server.get("/", { websocket: true }, (connection) => {
    const socket = connection.socket as WebSocket;

    clients.add(socket);
    console.log("📡 Klient připojen");

    socket.on("close", () => {
      clients.delete(socket);
      console.log("❌ Klient odpojen");
    });
  });

  server.decorate("broadcastDeviceUpdate", (data: any) => {
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    }
  });
}
