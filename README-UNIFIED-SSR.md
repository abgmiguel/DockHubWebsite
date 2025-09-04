# Multi-Tenant SSR Blog Platform - Unified Architecture

A dynamic multi-tenant blog platform with Server-Side Rendering (SSR) that serves multiple websites from a single deployment. Each tenant gets their own domain, database, theme, and configuration.

## 🚀 Features

- **True Multi-Tenancy**: Single codebase serving multiple domains
- **SSR with Astro**: Fast, SEO-friendly server-side rendering
- **Per-Tenant Isolation**: Each site has its own MongoDB database
- **Dynamic Configuration**: No hardcoding - everything driven by `sites-config.json`
- **Rich Text Editor**: TipTap-based blog editor with full formatting support
- **Auto-Authentication**: Automatic admin account creation from configuration
- **Custom Themes**: Each tenant can have unique layouts and styling

## 📁 Project Structure

```
.
├── astro-multi-tenant/       # Unified SSR frontend application
│   ├── src/
│   │   ├── config/          # Application configuration
│   │   ├── layouts/         # Per-tenant layouts
│   │   │   ├── codersinflow.com/
│   │   │   ├── darkflows.com/
│   │   │   └── default/
│   │   ├── lib/             # Tenant detection and utilities
│   │   ├── pages/           # Dynamic routing pages
│   │   │   ├── [...slug].astro      # Catch-all route
│   │   │   └── blog/[...slug].astro # Blog routes
│   │   └── utils/           # Helper functions (TipTap converter, etc.)
│   └── package.json
├── backend/                  # Go backend API
│   ├── cmd/server/          # Main server entry point
│   ├── internal/            # Internal packages
│   │   ├── handlers/        # API route handlers
│   │   ├── middleware/      # CORS, auth, tenant middleware
│   │   ├── models/          # Data models
│   │   └── database/        # MongoDB connection
│   └── go.mod
├── sites-config.json        # Main configuration file
├── docker-compose.unified.yml # Production deployment
└── Dockerfile.unified-ssr   # Production Docker image
```

## 🔧 Configuration

### sites-config.json

The entire system is configured through `sites-config.json`. This file controls:
- Which domains are served
- Database assignments
- Admin credentials
- Theme selection
- Feature flags

```json
{
  "codersinflow.com": {
    "id": "codersinflow",
    "directory": "codersinflow.com",
    "database": "codersinflow_db",
    "theme": "blue",
    "features": ["blog", "docs", "api"],
    "adminUser": {
      "email": "admin@codersinflow.com",
      "password": "coders2024!",
      "name": "CodersInFlow Admin"
    }
  },
  "darkflows.com": {
    "id": "darkflows",
    "directory": "darkflows.com",
    "database": "darkflows_db",
    "theme": "dark",
    "features": ["blog", "products"],
    "adminUser": {
      "email": "admin@darkflows.com",
      "password": "dark2024!",
      "name": "DarkFlows Admin"
    }
  }
}
```

## 🆕 Adding a New Site

### 1. Update Configuration

Add your new site to `sites-config.json`:

```json
{
  "yournewsite.com": {
    "id": "yournewsite",
    "directory": "yournewsite.com",
    "database": "yournewsite_db",
    "theme": "custom",
    "features": ["blog"],
    "adminUser": {
      "email": "admin@yournewsite.com",
      "password": "secure_password_here",
      "name": "Your Site Admin"
    }
  }
}
```

### 2. Create Layout (Optional)

Create a custom layout in `astro-multi-tenant/src/layouts/yournewsite.com/Layout.astro`:

```astro
---
export interface Props {
  title: string;
  tenant?: any;
}

const { title, tenant } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title} - Your Site</title>
    <style>
      /* Your custom styles */
    </style>
  </head>
  <body>
    <nav>
      <!-- Your navigation -->
    </nav>
    <slot />
  </body>
</html>
```

If no custom layout is provided, the system falls back to the default layout.

### 3. DNS Configuration

Point your domain to the server:
- For development: Add to `/etc/hosts`: `127.0.0.1 yournewsite.local`
- For production: Configure DNS A record to point to your server IP

## 🚀 Development Setup

### Prerequisites

- Node.js 20+
- Go 1.21+
- MongoDB 7.0+
- Docker & Docker Compose (optional)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository>
cd codersinflow.com
```

2. **Start MongoDB**
```bash
docker run -d --name mongodb-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=devpassword \
  mongo:7.0
```

3. **Install frontend dependencies**
```bash
cd astro-multi-tenant
npm install
```

4. **Start the backend**
```bash
cd ../backend
MONGODB_URI="mongodb://127.0.0.1:27017/codersblog" go run cmd/server/main.go
```

5. **Start the frontend**
```bash
cd ../astro-multi-tenant
PUBLIC_API_URL=http://127.0.0.1:3001 npm run dev
```

6. **Access the sites**
- CodersInFlow: http://127.0.0.1:4321
- With custom domain: Add to `/etc/hosts` then access http://yourdomain.local:4321

## 🐳 Production Deployment

### Using Docker Compose

1. **Build and start all services**
```bash
docker-compose -f docker-compose.unified.yml up -d
```

2. **Services will be available on**
- Frontend (SSR): Port 80
- Backend API: Port 3001
- MongoDB: Port 27017

### Manual Deployment

1. **Build the frontend**
```bash
cd astro-multi-tenant
npm ci
npm run build
```

2. **Build the backend**
```bash
cd backend
go build -o server cmd/server/main.go
```

3. **Set environment variables**
```bash
export NODE_ENV=production
export PORT=4321
export API_PORT=3001
export MONGODB_URI=mongodb://127.0.0.1:27017/codersblog
export JWT_SECRET=your_secret_here
export PUBLIC_API_URL=http://127.0.0.1:3001
```

4. **Start services**
```bash
# Start backend
./backend/server &

# Start frontend SSR
cd astro-multi-tenant
node ./dist/server/entry.mjs
```

## 🔍 How It Works

### Multi-Tenant Request Flow

1. **Request arrives** at the Astro SSR server
2. **Host header detection** in `[...slug].astro`:
   ```typescript
   const hostname = Astro.request.headers.get('host')
   const tenant = getTenantFromHost(hostname)
   ```

3. **Tenant identification** via `sites-config.json` lookup
4. **Layout selection** based on tenant directory
5. **API requests** include tenant headers:
   ```typescript
   headers: {
     'X-Tenant-Domain': hostname,
     'X-Tenant-Id': tenant.id,
     'X-Site-Database': tenant.database
   }
   ```

6. **Backend routing** uses tenant info for database selection
7. **Response rendered** with tenant-specific layout and data

### Database Isolation

Each tenant's data is stored in a separate MongoDB database:
- `codersinflow_db` for codersinflow.com
- `darkflows_db` for darkflows.com
- Database selection happens automatically based on request headers

### Authentication

- Admin accounts are automatically created on first startup
- Credentials come from `sites-config.json`
- JWT tokens are used for API authentication
- Each tenant has isolated user accounts

## 📝 API Endpoints

### Public Endpoints
- `GET /api/posts` - List blog posts
- `GET /api/posts/{slug}` - Get post by slug
- `GET /api/categories` - List categories
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints (Require JWT)
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `GET /api/auth/me` - Get current user

All endpoints automatically scope data to the requesting tenant.

## 🛠️ Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Frontend SSR port | 4321 |
| `API_PORT` | Backend API port | 3001 |
| `MONGODB_URI` | MongoDB connection string | mongodb://127.0.0.1:27017/codersblog |
| `JWT_SECRET` | JWT signing secret | devsecret123 |
| `PUBLIC_API_URL` | Public API URL for frontend | http://127.0.0.1:3001 |

### Ports

- **4321**: Astro SSR server (development)
- **80**: Astro SSR server (production)
- **3001**: Backend API
- **27017**: MongoDB

## 🧪 Testing

### With Playwright

```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test

# Or use Playwright MCP for interactive testing
```

### Manual Testing

1. **Test multi-tenancy**:
```bash
# Test different domains
curl -H "Host: codersinflow.com" http://127.0.0.1:4321/
curl -H "Host: darkflows.com" http://127.0.0.1:4321/
```

2. **Test API**:
```bash
# Get posts for specific tenant
curl -X GET http://127.0.0.1:3001/api/posts \
  -H "X-Tenant-Domain: codersinflow.com" \
  -H "X-Tenant-Id: codersinflow" \
  -H "X-Site-Database: codersinflow_db"
```

## 🐛 Troubleshooting

### Common Issues

1. **"mongodb: no such host"**
   - Ensure MongoDB is running
   - Check MONGODB_URI uses `127.0.0.1` not `localhost`

2. **CORS errors**
   - Verify backend middleware order (CORS must be before routes)
   - Check PUBLIC_API_URL matches actual backend URL

3. **"Host not allowed" in development**
   - Add domain to `vite.config.js` allowedHosts
   - Or use `127.0.0.1` instead of custom domain

4. **Port already in use**
   - Check for running processes: `lsof -i :PORT`
   - Kill existing process: `kill PID`

5. **Blog posts not rendering**
   - Ensure backend is running on port 3001
   - Check MongoDB connection
   - Verify tenant headers are being sent

## 🏗️ Architecture Decision Records

### Why Unified SSR?

Initially, we considered static site generation with separate builds per tenant, but chose SSR because:
1. **Real-time data**: Blog posts need to be immediately visible after creation
2. **Simpler deployment**: One process instead of multiple static servers
3. **Dynamic routing**: Easier to handle multi-tenant routing with SSR
4. **Resource efficiency**: Single Node.js process serves all tenants

### Why 127.0.0.1 over localhost?

- Avoids IPv6 issues on macOS
- More predictable behavior across different systems
- Consistent with production networking practices

### Why Host Header Detection?

- Standard HTTP approach for multi-tenancy
- Works with any reverse proxy (Nginx, Cloudflare, etc.)
- No need for complex URL rewriting
- Clean URLs for each tenant

## 📚 Key Files Explained

### `src/lib/tenant.ts`
Handles tenant detection from Host header and configuration lookup.

### `src/pages/[...slug].astro`
Main catch-all route that:
- Detects tenant from Host header
- Loads appropriate layout
- Routes to correct content

### `src/pages/blog/[...slug].astro`
Blog-specific routing that:
- Handles blog listing, individual posts, and editor
- Converts TipTap JSON to HTML
- Manages blog categories

### `src/utils/tiptap.ts`
Converts TipTap editor JSON format to HTML for rendering.

### `src/config/app.config.ts`
Centralized configuration for ports and URLs.

## 🔄 Migration from Old Architecture

If migrating from the static multi-site architecture:

1. **Backup existing data**
2. **Update sites-config.json** with all tenants
3. **Copy custom layouts** to `astro-multi-tenant/src/layouts/`
4. **Update DNS/proxy** to point to new SSR port
5. **Test each tenant** thoroughly

## 📄 License

[Your License Here]

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly with multiple tenants
4. Submit a pull request

## 📞 Support

For issues or questions:
- GitHub Issues: [repository issues]
- Email: [support email]
- Documentation: This README and inline code comments