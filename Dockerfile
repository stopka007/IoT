FROM node:18-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/package.json
COPY my-turborepo/packages ./my-turborepo/packages

RUN pnpm install --filter server --prod=false --frozen-lockfile

FROM base AS builder
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/apps ./apps
COPY --from=deps /usr/src/app/package.json ./package.json
COPY --from=deps /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /usr/src/app/my-turborepo/packages ./my-turborepo/packages

COPY apps/server ./apps/server
COPY my-turborepo/packages ./my-turborepo/packages
COPY turbo.json ./turbo.json

RUN pnpm --filter server run build
RUN pnpm deploy --filter server --prod ./deploy_output/server

FROM base AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 serveruser

COPY --from=builder --chown=serveruser:nodejs /usr/src/app/deploy_output/server ./

USER serveruser

EXPOSE 3000
CMD ["node", "dist/index.js"] 