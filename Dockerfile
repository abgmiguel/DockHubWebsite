# Unified SSR Multi-tenant Dockerfile
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy the unified Astro app
COPY astro-multi-tenant/ /build/

# Make scripts executable
RUN chmod +x /build/scripts/*.sh

# Install dependencies and build
RUN npm ci && npm run build

# Backend builder
FROM golang:1.21-alpine AS backend-builder

WORKDIR /build

# Copy backend source
COPY backend/ /build/

# Build backend
RUN go mod download && \
    go build -o server cmd/server/main.go

# Runtime stage  
FROM node:20-slim

# Install supervisor, MongoDB, Go, inotify-tools and required tools
RUN apt-get update && apt-get install -y \
    supervisor \
    wget \
    gnupg \
    curl \
    inotify-tools \
    && wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - \
    && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-org \
    && curl -L https://go.dev/dl/go1.21.5.linux-amd64.tar.gz | tar -C /usr/local -xz \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PM2 globally
RUN npm install -g pm2

# Add Go to PATH
ENV PATH="/usr/local/go/bin:${PATH}"

# Create necessary directories
RUN mkdir -p /var/log/supervisor /data/db /var/log/mongodb /var/log/pm2

WORKDIR /app

# Copy built Astro app (both internal and for external mount)
COPY --from=frontend-builder /build/dist /app/dist-internal
COPY --from=frontend-builder /build/dist /app/dist
COPY --from=frontend-builder /build/package.json /app/
COPY --from=frontend-builder /build/node_modules /app/node_modules
COPY --from=frontend-builder /build/node_modules /app/node_modules-internal

# Copy source sites (both internal and for external mount)
COPY --from=frontend-builder /build/src/sites /app/src/sites-internal
RUN mkdir -p /app/src/sites

# Copy ALL source files for rebuild capability
COPY --from=frontend-builder /build/src /app/src-internal
COPY --from=frontend-builder /build/astro.config.mjs /app/
COPY --from=frontend-builder /build/tsconfig.json /app/

# Copy backend (both internal and for external mount)
COPY --from=backend-builder /build/server /app/server-internal
COPY --from=backend-builder /build/server /app/server
RUN chmod +x /app/server /app/server-internal

# Copy configuration files
COPY sites-config.json /app/sites-config-internal.json
COPY sites-config.json /app/sites-config.json
COPY scripts/supervisor.conf /etc/supervisor/supervisord.conf
COPY ecosystem.config.cjs /app/ecosystem.config.cjs

# Copy and setup entrypoint script
COPY scripts/docker-entrypoint-rebuild.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose ports (these will be overridden by runtime env vars)
EXPOSE 4321 3001

# Use entrypoint to handle mount syncing on startup
ENTRYPOINT ["/docker-entrypoint.sh"]