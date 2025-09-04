# All-in-One Docker Deployment

This setup runs MongoDB, Backend (Go), and Frontend (Node.js) in a single Docker container managed by Supervisor.

## Quick Start

1. **Set environment variables** in `.env`:
```bash
MONGO_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
DOMAIN=codersinflow.com
PUBLIC_API_URL=https://codersinflow.com/api
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=initial_admin_password
```

2. **Build and run**:
```bash
docker-compose -f docker-compose.all-in-one.yml up -d --build
```

3. **View logs**:
```bash
# All logs
docker-compose -f docker-compose.all-in-one.yml logs -f

# Supervisor logs (from volume)
tail -f logs/supervisor/*.log
```

4. **Access services**:
- Frontend: http://localhost
- API: http://localhost/api
- Uploads: http://localhost/uploads

## Management Commands

```bash
# Stop
docker-compose -f docker-compose.all-in-one.yml down

# Restart
docker-compose -f docker-compose.all-in-one.yml restart

# Rebuild after code changes
docker-compose -f docker-compose.all-in-one.yml up -d --build

# Access container shell
docker exec -it codersinflow-all bash

# Check service status inside container
docker exec -it codersinflow-all supervisorctl status

# Restart a specific service
docker exec -it codersinflow-all supervisorctl restart backend

# MongoDB shell
docker exec -it codersinflow-all mongosh -u admin -p $MONGO_PASSWORD --authenticationDatabase admin
```

## Backup & Restore

### Backup MongoDB
```bash
docker exec codersinflow-all mongodump \
  -u admin -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --out /app/backups/$(date +%Y%m%d)
```

### Restore MongoDB
```bash
docker exec codersinflow-all mongorestore \
  -u admin -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  /app/backups/20240101
```

## SSL/HTTPS Setup

For production with HTTPS:

1. **Install certbot** on host:
```bash
sudo apt install certbot
```

2. **Get certificates**:
```bash
sudo certbot certonly --standalone -d codersinflow.com
```

3. **Update nginx config** in container to use SSL:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/codersinflow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codersinflow.com/privkey.pem;
    # ... rest of config
}
```

4. **Auto-renewal** (on host):
```bash
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet && docker restart codersinflow-all
```

## Monitoring

The container includes health checks. Monitor with:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## Troubleshooting

### Services not starting
```bash
# Check supervisor logs
docker exec -it codersinflow-all tail -f /var/log/supervisor/*.log

# Check individual service status
docker exec -it codersinflow-all supervisorctl status
```

### MongoDB connection issues
```bash
# Verify MongoDB is running
docker exec -it codersinflow-all ps aux | grep mongod

# Check MongoDB logs
docker exec -it codersinflow-all tail -f /var/log/supervisor/mongodb.log
```

### Permission issues
```bash
# Fix permissions from host
sudo chown -R 999:999 runtime/mongodb
sudo chown -R www-data:www-data uploads
```

## Performance Tuning

Uncomment resource limits in docker-compose.all-in-one.yml and adjust based on your server:
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