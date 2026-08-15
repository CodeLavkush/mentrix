# ==========================================
# Base
# ==========================================
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN corepack enable
RUN corepack prepare pnpm@11.12.0 --activate

WORKDIR /app


# ==========================================
# Dependencies
# ==========================================
FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY prisma.config.ts ./

RUN pnpm config set registry https://registry.npmjs.org/ \
    && pnpm config set fetch-timeout 600000 \
    && pnpm config set fetch-retries 5 \
    && pnpm config set fetch-retry-factor 2 \
    && pnpm config set fetch-retry-mintimeout 10000 \
    && pnpm config set fetch-retry-maxtimeout 120000 \
    && pnpm config set verify-store-integrity false

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma

RUN pnpm exec prisma generate


# ==========================================
# Builder
# ==========================================
FROM dependencies AS builder

COPY . .

RUN pnpm build

# ==========================================
# Production
# ==========================================
FROM base AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

CMD ["node", "dist/index.js"]