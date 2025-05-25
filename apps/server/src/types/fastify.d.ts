import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    broadcastDeviceUpdate: (data: any) => void;
  }
}
