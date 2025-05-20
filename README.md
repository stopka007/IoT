IoT Monorepo

A monorepo for an IoT project featuring a Fastify backend, a Vite React frontend, and MongoDB Atlas.

Structure

- `apps/iot-app/` – Frontend (Vite + React + TypeScript)
- `apps/server/` – Backend (Fastify + TypeScript + Mongoose)
- `my-turborepo/packages/` – Shared packages

Production Deployment

- **Frontend:** [iot-frontend-x8hz.onrender.com](https://iot-frontend-x8hz.onrender.com)
- **Backend:** [iot-backend-p3d6.onrender.com](https://iot-backend-p3d6.onrender.com/health)
- **Database:** MongoDB Atlas

Local Development Setup

 1. Clone the repository

```sh
git clone https://github.com/stopka007/IoT.git
cd IoT
```

2. Install dependencies

```sh
pnpm install
```

3. Configure environment variables

 Backend (`apps/server/`)

Create an `.env` file in `apps/server/`:

```
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
```

Frontend (`apps/iot-app/`)

Create an `.env` file in `apps/iot-app/`:

```
VITE_API_URL=
```

> For production, `.env.production` is already set up.

4. Start the backend & frontend

pnpm dev





enjoy:)
