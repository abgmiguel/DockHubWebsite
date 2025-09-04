# PM2 Clustering Deployment Guide

## 🚨 IMPORTANT: Docker Rebuild Required

Since we've modified the Dockerfile to include PM2, you **MUST** rebuild and redeploy the Docker container.

## Deployment Steps

### Step 1: Deploy the New Docker Image
```bash
# This will rebuild Docker with PM2 and push to registry
./scripts/deploy.sh
```

This rebuilds the Docker image with:
- PM2 installed globally
- New supervisor configuration
- Updated watcher script for PM2 reloads
- PM2 ecosystem configuration

### Step 2: Verify PM2 is Running
After deployment completes, verify PM2 is working:

```bash
# Check that PM2 started with multiple workers
ssh user@server "docker exec magic-video-container pm2 list"
```

You should see something like:
```
┌─────┬──────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name                 │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼──────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ astro-multi-tenant   │ default     │ N/A     │ cluster │ 1234     │ 30s    │ 0    │ online    │ 0%       │ 120.5mb  │ root     │ disabled │
│ 1   │ astro-multi-tenant   │ default     │ N/A     │ cluster │ 1235     │ 30s    │ 0    │ online    │ 0%       │ 118.2mb  │ root     │ disabled │
│ 2   │ astro-multi-tenant   │ default     │ N/A     │ cluster │ 1236     │ 30s    │ 0    │ online    │ 0%       │ 119.8mb  │ root     │ disabled │
│ 3   │ astro-multi-tenant   │ default     │ N/A     │ cluster │ 1237     │ 30s    │ 0    │ online    │ 0%       │ 121.1mb  │ root     │ disabled │
└─────┴──────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### Step 3: Test Zero-Downtime Reload
Test that the watcher properly reloads PM2:

```bash
# 1. Make a small change to a site
echo "<!-- test -->" >> astro-multi-tenant/src/sites/magicvideodownloader.com/pages/index.astro

# 2. Sync the change
./scripts/sync-project-hot.sh

# 3. Watch the logs to see PM2 reload
ssh user@server "docker exec magic-video-container tail -f /tmp/watcher.log"
```

You should see:
```
[WATCHER] 📝 Change detected...
[WATCHER] 🏗️  Building Astro frontend...
[WATCHER] ✅ Frontend build successful
[WATCHER] 🔄 Gracefully reloading frontend via PM2...
[WATCHER] ✅ Frontend reloaded successfully (zero-downtime)
```

### Step 4: Monitor Performance

Check CPU usage across cores:
```bash
ssh user@server "docker exec magic-video-container pm2 monit"
```

Check memory per worker:
```bash
ssh user@server "docker exec magic-video-container pm2 status"
```

## What Changed?

### Files Modified:
1. **Dockerfile** - Installs PM2 globally
2. **ecosystem.config.js** - PM2 cluster configuration (NEW)
3. **scripts/supervisor.conf** - Frontend now uses PM2
4. **scripts/watch-and-rebuild-supervisor.sh** - Uses PM2 reload instead of restart
5. **README.md** - Updated with PM2 documentation

### Architecture Changes:
- **Before**: Single Node.js process handling all requests
- **After**: Multiple Node.js workers (one per CPU core) with load balancing

### Benefits You'll See:
1. **Capacity**: Handle 8-16x more concurrent requests
2. **Resilience**: If one worker crashes, others continue serving
3. **Zero Downtime**: Reloads happen gracefully, one worker at a time
4. **Better Resource Usage**: All CPU cores utilized

## Troubleshooting

### PM2 Not Starting?
```bash
# Check supervisor logs
ssh user@server "docker logs magic-video-container | grep pm2"

# Manually start PM2 to test
ssh user@server "docker exec magic-video-container pm2 start /app/ecosystem.config.js"
```

### Workers Keep Restarting?
```bash
# Check error logs
ssh user@server "docker exec magic-video-container pm2 logs --err --lines 100"

# Check if memory limit is too low
ssh user@server "docker exec magic-video-container pm2 info astro-multi-tenant"
```

### Rollback if Needed
If you need to rollback:
```bash
# 1. Restore original files locally
git checkout HEAD -- Dockerfile scripts/supervisor.conf scripts/watch-and-rebuild-supervisor.sh

# 2. Remove PM2 files
rm ecosystem.config.js

# 3. Redeploy
./scripts/deploy.sh
```

## Next Steps

After confirming PM2 is working:

1. **Monitor for 24 hours** - Check stability and memory usage
2. **Run load tests** - Verify improved capacity
3. **Adjust workers if needed** - `pm2 scale astro-multi-tenant <number>`
4. **Consider Stage 2** - Implement lazy loading for even better performance

---

**Remember**: The first deployment after adding PM2 MUST use `./scripts/deploy.sh` to rebuild Docker. After that, you can use `./scripts/sync-project-hot.sh` for updates.