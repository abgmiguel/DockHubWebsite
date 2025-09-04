# Project Structure Overview

## Current State (Multi-Tenant Branch)

This project now supports **two deployment modes**:

### 1. Multi-Tenant Mode (NEW)
- Multiple sites from one codebase
- Sites stored in `frontends/` directory
- Each site has its own theme and database
- Single Docker container with all sites

### 2. Single-Site Mode (ORIGINAL - Still Works!)
- Traditional single website deployment
- Uses root `src/` and `public/` directories
- Original Docker and deployment scripts still function

## Directory Structure

```
.
├── src/                          # ORIGINAL site source (keep for single-site mode)
├── public/                       # ORIGINAL site assets (keep for single-site mode)
├── frontends/                    # MULTI-TENANT sites
│   ├── codersinflow.com/        # Copy of original site for multi-tenant
│   ├── darkflows.com/           # Example second site (red theme)
│   └── default/                 # Default landing page
├── backend/                      # Shared backend (works for both modes)
├── docker/                       # Docker configurations
│   ├── server.js                # Multi-tenant routing server
│   └── supervisord-multi.conf   # Multi-tenant process manager
└── scripts/                      # Various utility scripts
```

## Why Keep Both src/ and frontends/codersinflow.com/?

1. **Backward Compatibility**: Original deployment scripts (`dev.sh`, `deploy.sh`) still work
2. **Gradual Migration**: You can test multi-tenant without breaking existing setup
3. **Safety**: If multi-tenant has issues, single-site mode is unchanged

## Scripts Overview

### Multi-Tenant Scripts (NEW)
- `dev-multi-tenant.sh` - Development for multi-tenant
- `build-docker-multi-tenant.sh` - Build multi-tenant Docker
- `scripts/dev-multi-tenant.js` - Test server with domain simulation
- `scripts/build-multi-tenant.sh` - Build all sites

### Original Scripts (STILL WORK)
- `dev.sh` - Original development environment
- `deploy.sh` - Original deployment
- `build-docker.sh` - Original Docker build
- `deploy-docker.sh` - Docker deployment

### Old/Deprecated Scripts (Can be removed)
- `fix-astro-server.sh` - Old fix, no longer needed
- `fix-auth-redirects.sh` - Old fix, no longer needed
- `pull_submodules.sh` - Not using submodules
- `quick-upload.sh` - Old deployment method
- `server-rebuild.sh` - Old server management
- `server-update.sh` - Old server management
- `deploy-initial.sh` - Old initial deployment

## Files/Directories to Clean

Run `./cleanup-old-files.sh` to identify and optionally remove:
- Old fix scripts
- `test-dist/` directory (98MB)
- `.astro/` build cache

## Which Mode Should I Use?

### Use Multi-Tenant Mode if:
- You want to host multiple sites
- Sites need different themes/branding
- You want to give clients their own site directory
- You need separate databases per site

### Use Single-Site Mode if:
- You only have one website
- You want the simplest setup
- You're already deployed and working

## Migration Path

### From Single-Site to Multi-Tenant:
1. Your site is already copied to `frontends/codersinflow.com/`
2. Test with: `./dev-multi-tenant.sh test`
3. Build Docker: `./build-docker-multi-tenant.sh`
4. Deploy: `docker-compose -f docker-compose.multi-tenant.yml up`

### Staying with Single-Site:
- Nothing changes! Continue using:
  - `./dev.sh` for development
  - `./deploy.sh` for deployment
  - Root `src/` and `public/` directories

## Important Notes

1. **Both modes are fully functional** - Choose based on your needs
2. **No breaking changes** - Original setup still works
3. **Root src/ is safe to keep** - Needed for single-site mode
4. **frontends/ is for multi-tenant** - Each site is self-contained

## Quick Decision Guide

```
Do you need multiple sites with different themes?
  YES → Use Multi-Tenant Mode
  NO  → Use Single-Site Mode (simpler)

Are you already deployed and working?
  YES → Keep using Single-Site Mode (no changes needed)
  NO  → Consider Multi-Tenant for future flexibility
```

## Cleanup Recommendation

To clean up old files safely:
```bash
# First, check what would be removed
./cleanup-old-files.sh check

# Backup old files (recommended)
./cleanup-old-files.sh backup

# Or remove directly if confident
./cleanup-old-files.sh remove
```

This preserves both deployment modes while removing truly obsolete files.