# Development Guide

This guide explains how to run the blog system for development.

## Ports Used

- **4321**: Astro frontend (standard)
- **8749**: Go backend API (non-standard to avoid conflicts)
- **27419**: MongoDB (non-standard to avoid conflicts with local MongoDB)

## Option 1: Docker Development (Recommended)

This runs everything in containers with hot reload:

```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:4321
- API: http://localhost:8749
- MongoDB: mongodb://localhost:27419

## Option 2: Local Development

Run services individually for faster development:

### 1. Start MongoDB (Docker)
```bash
# Run only MongoDB in Docker
docker-compose up -d mongodb
```

### 2. Start Backend (Local)
```bash
cd backend
./scripts/dev.sh

# Or manually:
export PORT=8749
export MONGODB_URI="mongodb://admin:password@localhost:27419/codersblog?authSource=admin"
export JWT_SECRET="dev-secret-key"
export CORS_ORIGIN="http://localhost:4321"
go run cmd/server/main.go
```

### 3. Start Frontend (Local)
```bash
# In project root
npm run dev
```

## Hot Reload Setup

### Frontend (Astro)
Already configured - changes to `.astro`, `.tsx`, and other files trigger instant reload.

### Backend (Go)
Install `air` for hot reload:
```bash
go install github.com/cosmtrek/air@latest
```

Then the dev script will automatically use it.

## Environment Variables

Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Key variables:
- `PUBLIC_API_URL`: Backend API URL (default: http://localhost:8749)
- `JWT_SECRET`: Secret for JWT tokens (use strong value in production)

## Database Access

### MongoDB Shell
```bash
docker exec -it mongodb mongosh -u admin -p password
use codersblog
db.posts.find().pretty()
db.users.find().pretty()
db.categories.find().pretty()
```

### MongoDB Compass
Connect with: `mongodb://admin:password@localhost:27419/codersblog?authSource=admin`

## Creating Content

1. **Login to Editor**: http://localhost:4321/editor
   - Default: admin@example.com / admin123

2. **Create Categories**: 
   - Go to Categories section
   - Create categories for blog and docs

3. **Create Posts**:
   - Click "New Blog Post" or "New Documentation"
   - Use the rich text editor
   - Save as draft or publish

## API Testing

### Login
```bash
curl -X POST http://localhost:8749/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Get Posts
```bash
# Blog posts
curl http://localhost:8749/api/posts?type=blog

# Documentation
curl http://localhost:8749/api/posts?type=docs
```

## Troubleshooting

### Port Conflicts
If you get port conflicts, check what's using the ports:
```bash
lsof -i :8749
lsof -i :27419
```

### MongoDB Connection Issues
- Ensure MongoDB container is running: `docker ps`
- Check logs: `docker-compose logs mongodb`
- Verify connection string in backend logs

### CORS Issues
- Make sure `CORS_ORIGIN` in backend matches frontend URL
- Check browser console for specific CORS errors

## Building for Production

```bash
# Build frontend
npm run build

# Build backend
cd backend
go build -o server cmd/server/main.go

# Or use Docker
docker-compose -f docker-compose.prod.yml build
```