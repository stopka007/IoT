FROM node:18-slim AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:18-slim AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
ENV PORT=10000
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:${PORT}"]