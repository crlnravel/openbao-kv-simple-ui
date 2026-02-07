# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base

LABEL maintainer="OpenBao KV Simple UI"

WORKDIR /app

ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=9.12.1
RUN npm install -g pnpm@$PNPM_VERSION

# Build stage
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

# Build application (creates standalone output)
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod --ignore-scripts

# Final stage for app image
FROM base

# Copy built application (standalone mode includes all necessary files)
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Runtime environment variable (can be overridden at runtime)
ENV OPENBAO_ADDR=""

EXPOSE 3000

CMD ["node", "server.js"]
