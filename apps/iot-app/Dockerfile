FROM node:18-slim AS builder
WORKDIR /repo

COPY ../../pnpm-workspace.yaml ./
COPY ../../pnpm-lock.yaml ./
COPY ../../package.json ./

COPY ../../apps ./apps
COPY ../../my-turborepo ./my-turborepo

WORKDIR /repo/apps/iot-app

RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm build

FROM node:18-slim AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /repo/apps/iot-app/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"] 