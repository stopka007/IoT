# IoT Monorepo

A monorepo for an IoT project featuring a Fastify backend, a Vite React frontend, and MongoDB Atlas.

---

## Structure

- `apps/iot-app/` – Frontend (Vite + React + TypeScript)
- `apps/server/` – Backend (Fastify + TypeScript + Mongoose)
- `my-turborepo/packages/` – (Optional) Shared packages

---

## Production Deployment

- **Frontend:** [iot-frontend-x8hz.onrender.com](https://iot-frontend-x8hz.onrender.com)
- **Backend:** [iot-backend-p3d8.onrender.com](https://iot-backend-p3d8.onrender.com)
- **Database:** MongoDB Atlas (URI configured in Render backend environment)

---

## Local Development Setup

### 1. Clone the repository

```sh
git clone https://github.com/stopka007/IoT.git
cd IoT
```

### 2. Install dependencies

```sh
pnpm install
```

### 3. Configure environment variables

#### Backend (`apps/server/`)

Create a `.env` file in `apps/server/`:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=1296000
JWT_REFRESH_EXPIRES_IN=5000000000000002220
```

#### Frontend (`apps/iot-app/`)

Create a `.env` file in `apps/iot-app/`:

```
VITE_API_URL=http://localhost:3000
```

> For production, `.env.production` is already set up and committed.

### 4. Start the backend

```sh
cd apps/server
pnpm dev
```

### 5. Start the frontend

```sh
cd apps/iot-app
pnpm dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

---

## Running Backend Tests

1. Create a `.env.test` file in `apps/server/` (copy from `.env` and update as needed):

```sh
cp apps/server/.env apps/server/.env.test
```

Edit `MONGO_URI` in `.env.test` to point to your test database.

Sample `.env.test`:

```
NODE_ENV=test
PORT=3001
MONGO_URI=mongodb://localhost:27017/iot-test
JWT_SECRET=your_test_jwt_secret
JWT_REFRESH_SECRET=your_test_refresh_secret
JWT_EXPIRES_IN=15070486486486486486
JWT_REFRESH_EXPIRES_IN=77486486486463513516467
API_URL=http://localhost:3001
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000
```

2. Run tests:

```sh
cd apps/server
pnpm test
```

---
