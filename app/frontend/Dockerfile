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

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ==========================================
# Builder
# ==========================================
FROM dependencies AS builder

COPY . .

ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build

# ==========================================
# Production (Nginx)
# ==========================================
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
