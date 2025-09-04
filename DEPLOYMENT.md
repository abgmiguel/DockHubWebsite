# Blog Deployment Guide

This guide explains how to deploy the blog system to production.

## Architecture

- **Frontend**: Static Astro build served by Nginx
- **Backend**: Go API running in Docker, proxied by Nginx
- **Database**: MongoDB running in Docker
- **Uploads**: Stored on the host filesystem, served by the Go backend

## Prerequisites

1. Server with Docker and Docker Compose installed
2. Nginx installed and configured
3. SSL certificates (already set up for codersinflow.com)

## Deployment Steps

### 1. Build the Frontend

On your local machine:

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Deploy Frontend Files

Copy the built files to your server:

```bash
# From your local machine
rsync -avz dist/ user@server:/var/www/codersinflow.com/
```

### 3. Set Up the Backend

On the server:

```bash
# Create necessary directories
mkdir -p /opt/codersinflow-blog
mkdir -p /opt/codersinflow-blog/uploads

# Copy backend files
# Copy docker-compose.prod.yml, backend directory, etc.

# Set environment variables
cat > /opt/codersinflow-blog/.env << EOF
JWT_SECRET=your-very-strong-secret-here
MONGO_PASSWORD=your-strong-mongo-password
MONGODB_URI=mongodb://admin:your-strong-mongo-password@blog-mongodb:27017/codersblog?authSource=admin
EOF

# Start the services
cd /opt/codersinflow-blog
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Configure Nginx

Add the blog locations to your Nginx configuration:

```nginx
# In /etc/nginx/sites-enabled/codersinflow.com
# After line 59 (include codersinflow-locations.conf), add:
include /etc/nginx/includes/blog-locations.conf;
```

Copy the blog-locations.conf file:

```bash
cp nginx/includes/blog-locations.conf /etc/nginx/includes/
```

Test and reload Nginx:

```bash
nginx -t
systemctl reload nginx
```

## Environment Variables

### Frontend (.env.production)
- `PUBLIC_API_URL`: Set to `https://codersinflow.com` (no trailing slash)

### Backend
- `JWT_SECRET`: Strong random secret for JWT tokens
- `MONGO_PASSWORD`: Strong password for MongoDB
- `CORS_ORIGIN`: Set to `https://codersinflow.com`

## Monitoring

Check service status:

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f blog-backend
```

## Backup

Important directories to backup:
- `/opt/codersinflow-blog/uploads/` - User uploaded images
- MongoDB data volume: `blog_mongodb_data`

## Troubleshooting

1. **API returns 502 Bad Gateway**
   - Check if backend is running: `docker ps`
   - Check backend logs: `docker logs codersinflow-blog-backend`

2. **Uploads fail**
   - Check permissions on uploads directory
   - Ensure backend container can write to /uploads

3. **Authentication issues**
   - Verify JWT_SECRET is the same across deployments
   - Check CORS_ORIGIN matches your domain exactly