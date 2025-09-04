# Multi-Tenant Public File Structure

## Directory Organization

```
/app/
├── public/                        # Site-specific public directories
│   ├── codersinflow/             # CodersInFlow public assets
│   │   ├── images/
│   │   ├── downloads/
│   │   └── assets/
│   ├── darkflows/                # DarkFlows public assets
│   │   ├── images/
│   │   └── assets/
│   └── magicvideodownloader/     # Magic Video Downloader public assets
│       ├── images/
│       └── downloads/
│
├── uploads/                      # User-uploaded content (separated by domain)
│   ├── blog/                     # Blog-specific uploads
│   │   ├── codersinflow/        # CodersInFlow blog media
│   │   │   ├── 2025/
│   │   │   └── posts/
│   │   ├── darkflows/           # DarkFlows blog media
│   │   │   └── posts/
│   │   └── magicvideodownloader/ # Magic Video Downloader blog media
│   │       └── posts/
│   └── general/                  # General uploads
│       ├── codersinflow/
│       ├── darkflows/
│       └── magicvideodownloader/
│
└── dist/client/                  # Built/compiled assets
    ├── _astro/                   # Astro built assets (shared)
    ├── sites/                    # Site-specific built assets
    │   ├── codersinflow/
    │   ├── darkflows/
    │   └── magicvideodownloader/
    └── [shared assets]

```

## URL Mapping

### Public Assets
- **URL**: `/public/logo.png`
- **Maps to**: `/app/public/{site_id}/logo.png`
- **Example**: `codersinflow.com/public/logo.png` → `/app/public/codersinflow/logo.png`

### Blog Media
- **URL**: `/blog/uploads/2025/01/image.jpg`
- **Maps to**: `/app/uploads/blog/{site_id}/2025/01/image.jpg`
- **Example**: `darkflows.com/blog/uploads/2025/01/image.jpg` → `/app/uploads/blog/darkflows/2025/01/image.jpg`

### Static Assets (images, fonts, etc.)
- **URL**: `/images/hero.jpg`
- **Tries in order**:
  1. `/app/public/{site_id}/images/hero.jpg` (site-specific)
  2. `/app/dist/client/sites/{site_id}/images/hero.jpg` (site built assets)
  3. `/app/dist/client/images/hero.jpg` (shared built assets)
  4. Proxies to Astro frontend (dynamic generation)

## Key Features

### 1. **Domain Isolation**
Each domain has completely separate:
- Public asset directories
- Blog upload directories
- Built asset directories

### 2. **Automatic Routing**
The `$site_id` variable is automatically extracted from the domain:
- `codersinflow.com` → `site_id = codersinflow`
- `www.darkflows.com` → `site_id = darkflows`
- `magicvideodownloader.com` → `site_id = magicvideodownloader`

### 3. **Fallback Chain**
Assets are searched in priority order:
1. Site-specific directories
2. Shared/common directories
3. Dynamic generation via Astro

### 4. **Security**
- Directory listing disabled
- Direct file serving (no Node.js overhead)
- Proper cache headers (30 days)
- Content-Type enforcement

## Benefits

✅ **Complete domain isolation** - No file conflicts between sites
✅ **Efficient serving** - Static files served directly by nginx
✅ **Organized structure** - Clear separation of concerns
✅ **Scalable** - Easy to add new sites
✅ **Secure** - Each site can only access its own files

## Adding a New Site

When adding a new site (e.g., `newsite.com`):

1. Create directories:
```bash
mkdir -p /app/public/newsite
mkdir -p /app/uploads/blog/newsite
```

2. Add SSL certificate:
```bash
./scripts/add-ssl-cert.sh newsite.com
```

3. That's it! Nginx automatically handles the routing based on the domain name.