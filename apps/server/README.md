# Fastify Backend Server

A modern Fastify backend with TypeScript using tsup as the bundler.

## Features

- 🚀 [Fastify](https://fastify.io/) - Fast and low overhead web framework for Node.js
- 📝 TypeScript support with modern ESM modules
- 📦 [tsup](https://github.com/egoist/tsup) - TypeScript bundler powered by esbuild
- 📚 Swagger documentation built-in
- 🔄 Hot reloading during development
- 🧪 Ready to integrate with testing frameworks

## Getting Started

### Installation

```bash
# From project root
cd apps/server
pnpm install
```

### Development

```bash
pnpm dev
```

This will start the server in development mode with hot-reloading.

### Building for Production

```bash
pnpm build
```

### Running in Production

```bash
pnpm start
```

## API Documentation

When the server is running, visit the Swagger documentation at:

```
http://localhost:3000/docs
```

## Health Check

The server includes a health check endpoint at:

```
GET /health
```
