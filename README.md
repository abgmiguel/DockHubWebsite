# Multi-Tenant Astro SSR Platform


A production-ready multi-tenant web platform built with Astro SSR, supporting unlimited sites with dynamic SSL, unified backend, and Docker deployment.

## 🚀 Features

- **Multi-tenant Architecture**: Support unlimited sites from a single codebase
- **Hot-Reload Production**: Add/modify sites without container restarts
- **Dynamic SSL Certificates**: Automatic SSL certificate selection based on domain
- **Unified Backend**: Shared Go backend with MongoDB for all sites
- **Docker Deployment**: Production-ready Docker setup with supervisor
- **Auto-Rebuild Watcher**: File changes trigger automatic rebuilds
- **Blacklist Support**: Exclude specific sites from deployment  
- **Quick Sync**: Update code without rebuilding Docker images
- **Site Isolation**: Each site has its own components, styles, and data

## 📁 Project Structure

```
/
├── astro-multi-tenant/      # Frontend Astro SSR application
│   ├── src/
│   │   ├── sites/          # Individual site configurations
│   │   │   ├── default/
│   │   │   ├── magicvideodownloader.com/
│   │   │   └── .template/  # Template for new sites
│   │   ├── shared/         # Shared components across sites
│   │   └── layouts/        # Shared layouts
│   └── dist/               # Built frontend files
│
├── backend/                # Go backend server
│   ├── cmd/server/         # Server entry point
│   ├── handlers/           # API handlers
│   └── models/             # Database models
│
├── nginx/                  # Nginx configurations
│   ├── sites-enabled/      # Site-specific configs
│   └── includes/           # Shared includes
│
├── scripts/                # Deployment and utility scripts
│   ├── deploy.sh           # Main deployment script
│   ├── sync-project-hot.sh # Hot sync without container restart
│   ├── add-site.sh         # Add new site
│   ├── remove-site.sh      # Remove site
│   └── watch-and-rebuild-supervisor.sh  # Auto-rebuild watcher
│
├── sites-config.json       # Site configuration manifest
├── blacklist.txt           # Sites to exclude from deployment
├── Dockerfile              # Production Docker configuration
└── docker-compose.yml      # Docker compose setup
```

## 🛠️ Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Go 1.21+
- MongoDB (included in Docker)

### Environment Configuration

Create a `.env` file:

```bash
# Deployment
DEPLOY_SERVER=your-server.com
DEPLOY_USER=root
DEPLOY_PORT=22
REMOTE_BASE_DIR=/var/www/docker

# Docker
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=your-username
DOCKER_IMAGE_NAME=your-username/app-name
DOCKER_CONTAINER_NAME=multi-tenant-container

# Application
PORT=4321
API_PORT=3001
MONGODB_URI=mongodb://localhost:27017/codersblog
JWT_SECRET=your-secret-key
PUBLIC_API_URL=https://your-domain.com
```

### Local Development

```bash
# Install dependencies
cd astro-multi-tenant && npm install
cd ../backend && go mod download

# Run development server
./scripts/dev.sh
```

Access sites locally:
- Site Directory: http://localhost:4321
- Magic Video: http://magicvideodownloader.localhost:4321
- Any site: http://[site-id].localhost:4321

## 🚀 Deployment

### Initial Deployment

```bash
# Deploy everything (builds Docker image, pushes, deploys)
./scripts/deploy.sh
```

This will:
1. Build Docker image with blacklist filtering
2. Push to Docker registry  
3. Deploy to server
4. Setup nginx configurations
5. Start container with supervisor and PM2 clustering

**Note**: After adding PM2, you MUST run `./scripts/deploy.sh` to rebuild the Docker image with PM2 installed.

### Hot Sync Updates (No Container Restart!)

After initial deployment, use the hot sync script for instant updates:

```bash
# Sync changes without restarting container
./scripts/sync-project-hot.sh
```

How hot sync works:
1. Rsyncs project files to `/var/www/astro/`
2. File watcher detects changes automatically
3. Rebuilds frontend/backend as needed
4. Restarts only affected services via supervisor
5. **New sites become accessible immediately!**

## 🏗️ Adding New Sites

### Method 1: Using Script (Recommended)

```bash
# Add a new site
./scripts/add-site.sh newsite.com

# Sync to server (site becomes accessible immediately!)
./scripts/sync-project-hot.sh
```

This will:
1. Copy template to new site directory
2. Configure site settings
3. Update sites-config.json
4. Set up both www and non-www versions
5. Generate Tailwind CSS
6. **No container restart needed!**

### Method 2: Manual

1. Copy the template:
```bash
cp -r astro-multi-tenant/src/sites/.template astro-multi-tenant/src/sites/newsite.com
```

2. Update `sites-config.json`:
```json
{
  "sites": [
    {
      "id": "newsite",
      "domain": "newsite.com",
      "name": "New Site",
      "api": "https://newsite.com"
    }
  ]
}
```

3. Deploy:
```bash
./scripts/deploy.sh
```

## 🔒 SSL Configuration

The system uses dynamic SSL with nginx's `$ssl_server_name` variable:

```nginx
# Automatic certificate selection based on domain
ssl_certificate /etc/letsencrypt/live/$cert_domain/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/$cert_domain/privkey.pem;
```

Features:
- Supports unlimited domains without nginx config changes
- Automatic www to non-www redirects
- HTTP to HTTPS redirects
- Fallback to default certificate if domain cert missing

Setup SSL for new domain:
```bash
certbot certonly --nginx -d newsite.com -d www.newsite.com
```

## 🚫 Blacklisting Sites

To exclude sites from deployment, add to `blacklist.txt`:

```
codersinflow
darkflows
prestongarrison
```

Then deploy normally - blacklisted sites will be excluded from the Docker image.

## 📊 Architecture

### Frontend (Astro SSR with PM2 Clustering)
- Server-side rendering for SEO
- **PM2 cluster mode**: Utilizes all CPU cores (8-16x capacity increase)
- **Zero-downtime reloads**: Workers reload gracefully one-by-one
- **Auto-restart on crash**: Memory limits prevent runaway processes
- Dynamic component loading per site
- Shared components library
- Tailwind CSS with site-specific configs
- SmartLayout for automatic header detection

### Backend (Go + MongoDB)
- RESTful API with tenant isolation
- JWT authentication
- MongoDB for data persistence
- File upload handling
- Blog/content management

### Infrastructure
- Docker containerization with integrated supervisor
- PM2 cluster mode for Node.js (multi-core utilization)
- Nginx reverse proxy with dynamic SSL
- External volume mounts for hot reloading
- Auto-rebuild watcher with zero-downtime PM2 reloads
- Supervisor-managed processes (MongoDB, Backend, PM2/Frontend, Watcher)

## 🔄 Deployment Flow

### Production Architecture
```
Internet
   ↓
Nginx (Host)
   ├── SSL Termination (dynamic cert selection)
   ├── /api/* → localhost:3001 (Go backend)
   └── /* → localhost:4321 (Astro frontend)
        ↓
Docker Container
   ├── Supervisor (process manager)
   ├── MongoDB (localhost:27017)
   ├── Go Backend (:3001)
   ├── PM2 Cluster (manages multiple Node.js workers)
   │   └── Astro Frontend (:4321) × CPU cores
   └── Watcher (auto-rebuild service)
```

### Volume Mounts
Docker mounts these directories:
- `/var/www/astro/` - Full project for hot-reload rebuilds
- `/var/www/docker/uploads/` - User uploaded files
- `/var/www/docker/public/` - Static assets  
- `/var/www/docker/mongodb-data/` - Database files

The full project mount enables the watcher to rebuild without container restarts.

## 📝 Scripts Reference

| Script | Purpose |
|--------|---------|
| `deploy.sh` | Full deployment with Docker build and push |
| `sync-project-hot.sh` | Hot sync for instant updates without container restart |
| `add-site.sh` | Add new site to platform (forces lowercase) |
| `remove-site.sh` | Remove site from platform |
| `build-with-blacklist.sh` | Build Docker with site exclusions |
| `watch-and-rebuild-supervisor.sh` | Auto-rebuild watcher integrated with supervisor |
| `dev.sh` | Run local development environment |
| `generate-nginx-configs.sh` | Generate nginx configurations |

## 🐳 Docker Commands

```bash
# View logs
ssh user@server "docker logs magic-video-container"

# Restart container
ssh user@server "docker restart magic-video-container"

# Enter container
ssh user@server "docker exec -it magic-video-container /bin/bash"

# Check running processes
ssh user@server "docker exec magic-video-container ps aux"
```

## ⚡ PM2 Cluster Management

### Check PM2 Status
```bash
# View all worker processes
ssh user@server "docker exec magic-video-container pm2 list"

# Detailed info about the cluster
ssh user@server "docker exec magic-video-container pm2 info astro-multi-tenant"

# Real-time monitoring
ssh user@server "docker exec -it magic-video-container pm2 monit"

# View logs from all workers
ssh user@server "docker exec magic-video-container pm2 logs --lines 50"
```

### PM2 Operations
```bash
# Graceful reload (zero-downtime)
ssh user@server "docker exec magic-video-container pm2 reload astro-multi-tenant"

# Scale to specific number of workers
ssh user@server "docker exec magic-video-container pm2 scale astro-multi-tenant 8"

# Restart all workers (if needed)
ssh user@server "docker exec magic-video-container pm2 restart astro-multi-tenant"

# Check memory usage
ssh user@server "docker exec magic-video-container pm2 status"
```

### Performance Benefits
- **Capacity**: 8-16x more concurrent requests (uses all CPU cores)
- **Availability**: Zero-downtime deployments via graceful reloads
- **Resilience**: Auto-restart on crash with 1GB memory limit per worker
- **Load Balancing**: Automatic distribution across workers

### Implementation Notes
- PM2 runs in cluster mode with `instances: 'max'` (uses all available CPU cores)
- Each worker process handles ~70MB RAM vs single process
- Blog module works seamlessly - uses JWT (stateless) and MongoDB (shared)
- File uploads go to shared filesystem mount accessible by all workers
- Supervisor manages PM2 which manages the Node.js workers

## 🔧 Troubleshooting

### Container not starting
```bash
docker logs magic-video-container
```

### PM2 not starting
```bash
# Check if ecosystem.config.cjs exists in container
ssh user@server "docker exec magic-video-container ls -la /app/ecosystem.config.cjs"

# Start PM2 manually if needed
ssh user@server "docker exec magic-video-container pm2 start /app/ecosystem.config.cjs"

# Check PM2 logs for errors
ssh user@server "docker exec magic-video-container pm2 logs --err"
```

### ESM/CommonJS Issues
If you see "module is not defined" errors:
- Ensure ecosystem config uses `.cjs` extension (not `.js`)
- Update all references in Dockerfile and supervisor.conf
- The file must use `module.exports` syntax (CommonJS)

### SSL certificate issues
```bash
ls /etc/letsencrypt/live/
nginx -t
```

### MongoDB connection issues
```bash
docker exec magic-video-container ps aux | grep mongo
```

### Sync not working
1. Check Docker builds locally: `docker images | grep local-build`
2. Verify extraction: `ls -la .docker-build-output/`
3. Test SSH: `ssh user@server "ls /var/www/docker"`

### Watcher not rebuilding
```bash
# Check watcher logs
docker exec magic-video-container tail -f /tmp/watcher.log

# Check supervisor status
docker exec magic-video-container supervisorctl status

# Restart watcher if needed
docker exec magic-video-container supervisorctl restart watcher
```

### Cloudflare "Too Many Redirects" Error
This happens when Cloudflare SSL mode is set incorrectly:
1. Go to Cloudflare dashboard → SSL/TLS → Overview
2. Set encryption mode to **Full (strict)** (NOT Flexible)
3. Go to SSL/TLS → Edge Certificates
4. Enable **Always Use HTTPS**

**Important**: Using "Flexible" SSL mode causes redirect loops because:
- Cloudflare connects to origin via HTTP
- Nginx redirects HTTP to HTTPS
- Creates infinite redirect loop

## 🎨 Theming System

### Semantic Color Classes

Sites use semantic Tailwind classes that map to different colors:

```css
/* Each site defines these in tailwind.config.cjs */
bg-background    /* Main background */
bg-surface       /* Card/panel background */
bg-primary       /* Primary brand color */
text-primary     /* Primary text */
text-secondary   /* Secondary text */
border-default   /* Border colors */
```

### Site Configuration

Each site has:
- `config.json` - Site metadata
- `layout.astro` - Site layout/theme
- `tailwind.config.cjs` - Color mappings
- `pages/` - Site-specific pages
- `components/` - Optional custom components

## 📦 Production Optimizations

- **Image optimization**: Compressed and resized (max 800x800)
- **Blacklist filtering**: Reduces Docker image size
- **External mounts**: Data persists across deployments
- **Supervisor**: Ensures service reliability
- **Dynamic SSL**: Supports unlimited domains
- **Build caching**: Docker layer optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Create Pull Request

## 🔐 Security

- JWT tokens for authentication
- HTTP-only cookies for sessions
- Database isolation per tenant
- Input validation and sanitization
- CORS configuration per environment
- SSL/TLS encryption in production

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Check deployment logs
- Review this documentation

---

Built with ❤️ using Astro, Go, Docker, and Nginx