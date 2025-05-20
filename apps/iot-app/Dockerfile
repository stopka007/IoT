FROM node:18-slim AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm build

FROM node:18-slim AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
# Use PORT env var from Render instead of hardcoded port
ENV PORT=10000
# Bind to 0.0.0.0 to fix 502 Bad Gateway
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:${PORT}"] 