# ==============================================================================
# Dockerfile - سامانه مانیتورینگ هوشمند رسانه شرکت ملی پخش فرآورده‌های نفتی
# Multi-stage build for lightweight & secure production deployment
# ==============================================================================

# Stage 1: Build & Compile
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools if needed
RUN apk add --no-cache openssl

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy application source code
COPY . .

# Generate the PostgreSQL Prisma Client during image build without exposing
# production database credentials to the build stage. This URL is intentionally
# non-routable and is used only by prisma generate; no database connection or
# schema push occurs during the image build.
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=niopdc_app
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl wget

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary production artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# Health check to ensure container is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD-SHELL wget --no-verbose --tries=1 --spider "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
