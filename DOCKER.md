# Docker Deployment Guide for Codersinflow.com

This guide explains how to deploy codersinflow.com using Docker with a Docker Hub-based deployment strategy, designed to run multiple sites on a single server.

## Architecture Overview

The deployment uses:
- **Host Nginx**: Routes traffic to multiple Docker containers (handles SSL, proxying)
- **Docker Container**: Contains MongoDB, Go backend, and serves static files
- **Supervisor**: Manages processes inside the container

This architecture allows you to run 50+ websites on one server, each in its own container, with a single nginx routing traffic.

## Running Multiple Sites on One Server

Each site gets:
- Its own Docker container with unique ports
- Its own nginx config file on the host
- Its own directory under `/var/www/`

Example port allocation:
```
codersinflow.com    -> Container ports 4000-4001
darkflows.com       -> Container ports 4002-4003
anothersite.com     -> Container ports 4004-4005
```

To add a new site:
1. Clone the site to `/var/www/sitename.com`
2. Update `docker-compose.production.yml` with unique ports
3. Create nginx config with those ports
4. Run setup scripts

## Docker Hub Deployment Strategy

### 1. **Local: Build & Push** (`build-docker.sh`)
```bash
./build-docker.sh
```
- Builds multi-platform image (amd64/arm64)
- Pushes to Docker Hub: `proggod/codersinflow:latest`
- Uses build cache for faster builds
- Tags with timestamp for versioning

### 2. **Server: Pull & Deploy** (`deploy-docker.sh`)
```bash
./deploy-docker.sh
```
- Pulls latest image from Docker Hub
- No building on production server
- Just restarts with new image
- Sets up volumes for persistence

## Key Advantages vs Local Build

1. **No source code on server** - Only pulls built image
2. **Faster deployments** - No build time on server
3. **Version control** - Tagged images on Docker Hub
4. **Rollback capability** - Can pull previous versions
5. **Multi-platform support** - Works on AMD64 and ARM64

## Initial Setup

### 1. Configure Site Settings
The primary configuration is in `site.config.json`. All Docker configurations are generated from this file using templates:
```json
{
  "site": {
    "name": "codersinflow",
    "domain": "codersinflow.com"
  },
  "admin": {
    "email": "admin@codersinflow.com",
    "password": "changeme123",
    "name": "Admin"
  },
  "ports": {
    "frontend": 4916,
    "backend": 8752,
    "mongodb": 27419
  },
  "development": {
    "frontend": {"port": 4321},
    "backend": {"port": 8752},
    "mongodb": {"port": 27419}
  }
}
```

**IMPORTANT**: Always use `127.0.0.1` instead of `localhost` to avoid IPv6 issues.

### 2. Generate Docker Configurations from Templates
```bash
# Generate all Docker configs from site.config.json
bash scripts/process-docker-templates.sh

# Or use the Node.js wrapper
node setup-docker.js
```

This will:
- Process all template files in `templates/` directory
- Replace {{VARIABLE}} placeholders with values from site.config.json
- Generate docker-compose files, nginx configs, .env files, etc.
- Create secure passwords if not already set

### 3. Create Environment File
```bash
# Copy the example
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

Required variables:
- `MONGO_PASSWORD` - MongoDB admin password
- `JWT_SECRET` - JWT signing secret
- `DOMAIN` - Your domain (from site.config.json)
- `DOCKER_USERNAME` - Docker Hub username

### 4. Admin Account Initialization
The admin account is automatically created on first startup from `site.config.json`:
- The `init-admin` binary runs after MongoDB starts
- Reads admin credentials from site.config.json
- Creates or updates the admin user with hashed password
- Falls back to environment variables if config not found

### 5. Set Docker Hub Credentials
```bash
# Set as environment variable (don't commit!)
export DOCKER_PASSWORD=your_dockerhub_token

# Or login manually
docker login
```

## Development Setup

### Quick Start Development

```bash
# Start development environment with hot reloading
./dev.sh up

# This runs:
# - Frontend on http://127.0.0.1:4321 (with hot reload)
# - Backend API on http://127.0.0.1:8752 (with hot reload via Air)
# - MongoDB on 127.0.0.1:27419
```

**Note**: Always use `127.0.0.1` instead of `localhost` to avoid IPv6 resolution issues.

### Development Commands

```bash
./dev.sh up         # Start development environment
./dev.sh down       # Stop development environment
./dev.sh logs       # View all logs
./dev.sh shell      # Open container shell
./dev.sh mongo      # Open MongoDB shell
./dev.sh rebuild    # Rebuild from scratch
./dev.sh clean      # Remove all containers and volumes
./dev.sh help       # See all available commands
```

### Development Features

- **Hot Reloading**: Both frontend (npm dev) and backend (Air for Go)
- **Volume Mounts**: Edit code locally, see changes instantly
- **Separate MongoDB**: Development database isolated from production
- **Development Tools**: Includes debugging and development dependencies

### Development vs Production

| Aspect | Development | Production |
|--------|------------|------------|
| **Command** | `./dev.sh up` | `./deploy-docker.sh` |
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **Compose** | `docker-compose.dev.yml` | `docker-compose.production.yml` |
| **MongoDB** | Separate container | Inside main container |
| **Hot Reload** | Yes (Air + npm dev) | No |
| **Ports** | 4321 (frontend), 8752 (backend) | 4916 (frontend), 8752 (backend) |
| **Image** | Built locally | Pulled from Docker Hub |
| **Environment** | `.env.development` | `.env.production` |
| **Data** | Ephemeral (can clean) | Persistent volumes |

## Deployment Workflow

### First Time Server Setup (Once per server)

```bash
# Install nginx on host
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### First Time Site Deployment

```bash
# 1. On your local machine - Build and push
./build-docker.sh

# 2. On production server
ssh user@server
cd /var/www
git clone https://github.com/yourusername/codersinflow.com.git codersinflow.com
cd codersinflow.com

# 3. Set up host nginx for this site
./nginx/setup-host-nginx.sh

# 4. Create environment file
cp .env.production.example .env.production
nano .env.production  # Add your production values

# 5. Deploy container
./deploy-docker.sh
```

### Regular Updates

```bash
# 1. On local machine after code changes
git commit -m "Updates"
git push
./build-docker.sh

# 2. On production server
ssh user@server
cd /path/to/codersinflow
git pull
./deploy-docker.sh
```

## Template System

All Docker configurations are generated from templates using the same approach as the deployment scripts:

### Template Files
Located in `templates/` directory with {{VARIABLE}} placeholders:
- `templates/docker/docker-compose.dev.yml.template`
- `templates/docker/docker-compose.production.yml.template`
- `templates/docker/.env.development.template`
- `templates/docker/.env.production.template`
- `templates/backend/.air.toml.template`
- `templates/nginx/{{SITE_NAME}}.conf.template`
- `templates/docker/dev-startup.sh.template`

### Processing Templates
Run `scripts/process-docker-templates.sh` to:
1. Read all values from `site.config.json`
2. Replace {{VARIABLE}} placeholders using sed
3. Generate final configuration files
4. Create secure passwords if not set

This ensures nothing is hardcoded and everything comes from site.config.json.

## File Structure Explained

### Core Files

#### `Dockerfile`
Multi-stage build that:
1. Builds frontend with Node.js
2. Builds backend with Go
3. Creates final Ubuntu image with MongoDB and backend server

#### `nginx/codersinflow.com.conf`
Host nginx configuration that:
- Routes traffic from the internet to Docker containers
- Handles SSL termination with Let's Encrypt
- Proxies `/api/*` requests to container port 4001
- Serves static files from mounted volumes
- Manages multiple sites on the same server

Each site gets its own nginx config file and container with unique ports.

#### `docker/supervisord.conf`
Manages all processes inside the production container:
- MongoDB (starts first)
- init-admin (runs once after MongoDB to create admin user)
- Go backend (starts after MongoDB)
- Ensures all services restart if they crash

#### `docker/startup.sh`
Initialization script that:
- Creates MongoDB database admin user on first run
- Sets up proper permissions
- Starts supervisor to manage all services

#### `backend/cmd/init-admin/main.go`
Admin initialization program that:
- Reads admin credentials from site.config.json
- Creates or updates the application admin user
- Properly hashes passwords using bcrypt
- Runs automatically after MongoDB starts

### Deployment Scripts

#### `build-docker.sh`
- Logs into Docker Hub
- Sets up Docker buildx for multi-platform builds
- Builds image for both AMD64 and ARM64
- Pushes to Docker Hub with caching

#### `deploy-docker.sh`
- Pulls latest image from Docker Hub
- Creates necessary directories with proper permissions
- Stops old container
- Starts new container with volumes

#### `docker-compose.production.yml`
- Defines the production container configuration
- Maps volumes for persistent data
- Sets environment variables
- Configures health checks

### Development Files

#### `dev.sh`
- Manages development environment
- Creates config files if missing
- Provides easy commands (up, down, logs, shell, mongo)
- Handles rebuilding and cleaning

#### `Dockerfile.dev`
- Installs Node.js and Go development tools
- Includes Air for Go hot reloading
- Mounts source code as volumes
- Runs development servers

#### `docker-compose.dev.yml`
- Separate MongoDB container for development
- Volume mounts for hot reloading
- Development ports (3000, 3001)
- Auto-created by dev.sh if missing

#### `backend/.air.toml`
- Configuration for Air (Go hot reloader)
- Watches for Go file changes
- Automatically rebuilds and restarts backend

## Volume Mappings

The container uses these persistent volumes:

| Container Path | Host Path | Purpose |
|---------------|-----------|---------|
| `/data/db` | `/var/www/codersinflow.com/data/db` | MongoDB data |
| `/app/uploads` | `/var/www/codersinflow.com/uploads` | User uploads |
| `/var/log/supervisor` | `/var/www/codersinflow.com/logs` | Application logs |
| `/etc/letsencrypt` | `/etc/letsencrypt` | SSL certificates |

## Useful Commands

### Container Management
```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart container
docker-compose -f docker-compose.production.yml restart

# Stop container
docker-compose -f docker-compose.production.yml down

# Shell access
docker exec -it codersinflow bash

# Check service status inside container
docker exec -it codersinflow supervisorctl status
```

### Service Management (inside container)
```bash
# Restart specific service
docker exec -it codersinflow supervisorctl restart backend
docker exec -it codersinflow supervisorctl restart nginx
docker exec -it codersinflow supervisorctl restart mongodb

# View service logs
docker exec -it codersinflow tail -f /var/log/supervisor/backend.log
```

### Database Operations
```bash
# MongoDB shell
docker exec -it codersinflow mongosh -u admin -p $MONGO_PASSWORD --authenticationDatabase admin

# Backup MongoDB
docker exec codersinflow mongodump \
  -u admin -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --out /app/backups/$(date +%Y%m%d)

# Restore MongoDB
docker exec codersinflow mongorestore \
  -u admin -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  /app/backups/20240101
```

## SSL/HTTPS Setup

SSL is handled by the host nginx, not the container:

```bash
# Certificates are obtained automatically when running setup
./nginx/setup-host-nginx.sh

# Or manually with certbot
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d codersinflow.com \
    -d www.codersinflow.com

# Auto-renewal is set up automatically by certbot
# Check with: sudo systemctl status certbot.timer
```

## Monitoring

### Health Checks
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Manual health check
curl http://localhost/api/health
```

### Resource Usage
```bash
# Container stats
docker stats codersinflow

# Detailed inspection
docker inspect codersinflow
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs codersinflow

# Check compose configuration
docker-compose -f docker-compose.production.yml config
```

### MongoDB Issues
```bash
# Check MongoDB is running
docker exec -it codersinflow ps aux | grep mongod

# View MongoDB logs
docker exec -it codersinflow tail -f /var/log/supervisor/mongodb.log

# Fix permissions
sudo chown -R 999:999 /var/www/codersinflow.com/data/db
```

### Backend Not Responding
```bash
# Check backend logs
docker exec -it codersinflow tail -f /var/log/supervisor/backend.log

# Test backend directly
docker exec -it codersinflow curl http://localhost:3001/api/health
```

### Nginx Issues
```bash
# Test nginx config
docker exec -it codersinflow nginx -t

# Reload nginx
docker exec -it codersinflow supervisorctl restart nginx
```

## Rollback Process

If something goes wrong:

```bash
# 1. List available tags on Docker Hub
docker run --rm lumir/docker-registry-client \
  -r https://registry-1.docker.io \
  list proggod/codersinflow

# 2. Pull specific version
docker pull proggod/codersinflow:20240315-143022

# 3. Update docker-compose.production.yml to use specific tag
# Change: image: proggod/codersinflow:latest
# To: image: proggod/codersinflow:20240315-143022

# 4. Restart with old version
docker-compose -f docker-compose.production.yml up -d
```

## Performance Tuning

### Resource Limits
Edit `docker-compose.production.yml` to add limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'      # Max CPU cores
      memory: 8G       # Max RAM
    reservations:
      cpus: '1.0'      # Guaranteed CPU
      memory: 2G       # Guaranteed RAM
```

### MongoDB Tuning
Add to `docker/startup.sh` for production:
```bash
# Increase MongoDB cache
mongosh admin -u admin -p "$MONGO_PASSWORD" --eval "
  db.adminCommand({
    setParameter: 1,
    wiredTigerCacheSizeGB: 2
  })
"
```

## Security Notes

1. **Never commit `.env.production`** - Use `.env.production.example` as template
2. **Use strong passwords** - Generate with `openssl rand -base64 32`
3. **Restrict MongoDB** - Only accessible within container
4. **Regular updates** - Rebuild image monthly for security patches
5. **Backup regularly** - Automate MongoDB backups

## Migration from Current Setup

To migrate from your current non-Docker setup:

1. **Backup existing data**:
```bash
mongodump --uri="mongodb://localhost:27419/codersblog" --out=backup
```

2. **Copy uploads**:
```bash
cp -r /current/uploads/path /var/www/codersinflow.com/uploads
```

3. **Deploy Docker version**:
```bash
./deploy-docker.sh
```

4. **Restore data**:
```bash
docker exec -it codersinflow mongorestore \
  -u admin -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  /path/to/backup
```

## Comparison with Current Setup

| Aspect | Current (deploy.sh) | Docker |
|--------|-------------------|---------|
| Build Location | Local + Server | Local only |
| Deployment Speed | Slow (builds on server) | Fast (pull image) |
| Dependencies | Must install on server | All in container |
| Rollback | Complex | Simple (pull old image) |
| Portability | Server-specific | Runs anywhere |
| Resource Usage | Shared with host | Isolated |
| Updates | Risky (might break server) | Safe (contained) |

## Quick Reference

### Local Development
```bash
# Start development with hot reloading
./dev.sh up

# Access:
# - Frontend: http://127.0.0.1:4321
# - Backend API: http://127.0.0.1:8752
# - MongoDB: mongodb://admin:devpassword@127.0.0.1:27419/codersblog?authSource=admin

# Default admin login (from site.config.json):
# - Email: sales@codersinflow.com
# - Password: F0r3st40!
```

### Production Deployment
```bash
# 1. Build and push to Docker Hub (local)
./build-docker.sh

# 2. Deploy on server
ssh server
cd /var/www/codersinflow.com
./deploy-docker.sh

# Access:
# - Site: https://codersinflow.com
# - Container ports: 4916 (frontend), 8752 (backend) (proxied by host nginx)
```

## Next Steps

1. Test locally with `./dev.sh up`
2. Configure `.env.production` with production values
3. Build and push to Docker Hub with `./build-docker.sh`
4. Set up host nginx on server
5. Deploy with `./deploy-docker.sh`
6. Set up monitoring and automated backups