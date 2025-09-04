# Multi-Tenant Platform Optimization Roadmap

## Current State Analysis

### Limitations
- **Single Node.js process** handling all sites (bottleneck)
- **Memory inefficient**: All sites loaded into one process
- **Full restart on changes**: Affects all sites simultaneously  
- **No horizontal scaling**: Limited to single-thread performance
- **Expected capacity**: ~100-200 sites max before performance degradation

### Goal
Scale to support 1000+ sites with high availability and performance

---

## 🎯 Stage 1: Process Clustering (Immediate - 2-4 hours)

**Impact: 8-16x capacity increase, zero-downtime deployments**

### Implementation Steps

#### 1.1 Add PM2 to Docker Container
```dockerfile
# Add to Dockerfile
RUN npm install -g pm2
```

#### 1.2 Create PM2 Ecosystem Config
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'astro-multi-tenant',
    script: './dist/server/entry.mjs',
    cwd: '/app/astro-multi-tenant',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    watch: false, // We handle this with our watcher
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 4321
    },
    error_file: '/var/log/pm2/error.log',
    out_file: '/var/log/pm2/out.log',
    merge_logs: true,
    time: true
  }]
};
```

#### 1.3 Update Supervisor Configuration
Replace the frontend program in supervisor.conf:
```ini
[program:frontend]
command=pm2 start /app/ecosystem.config.js --no-daemon
directory=/app
priority=20
autostart=true
autorestart=false
startsecs=5
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

#### 1.4 Update Watcher for Graceful Reloads
Change rebuild script to use PM2 reload:
```bash
# Replace: supervisorctl restart frontend
# With: pm2 reload astro-multi-tenant
```

### Testing Checklist
- [ ] Verify all CPU cores are utilized: `pm2 status`
- [ ] Test graceful reload doesn't drop requests
- [ ] Monitor memory usage per worker
- [ ] Confirm auto-restart on memory limit
- [ ] Load test with multiple concurrent requests

### Expected Results
- Handle 8-16x more concurrent requests
- Zero-downtime deployments
- Automatic recovery from crashes
- Better CPU utilization

---

## 🚀 Stage 2: Lazy Loading & Memory Optimization (1 day)

**Impact: 70% memory reduction, support for 500+ sites**

### Implementation Steps

#### 2.1 Implement Dynamic Site Loading
```javascript
// lib/site-loader.js
const siteCache = new Map();
const MAX_CACHE_SIZE = 100;

export async function loadSiteConfig(domain) {
  if (siteCache.has(domain)) {
    return siteCache.get(domain);
  }
  
  // Dynamically import site
  const config = await import(`../sites/${domain}/config.json`);
  
  // LRU cache eviction
  if (siteCache.size >= MAX_CACHE_SIZE) {
    const firstKey = siteCache.keys().next().value;
    siteCache.delete(firstKey);
  }
  
  siteCache.set(domain, config);
  return config;
}
```

#### 2.2 Optimize Tailwind CSS Generation
- Pre-build CSS for all sites during Docker build
- Serve pre-built CSS instead of runtime generation
- Use CSS purging to minimize file sizes

#### 2.3 Implement Shared Component Pool
- Load shared components once
- Site-specific components loaded on-demand
- Use WeakMap for automatic garbage collection

### Expected Results
- 70% reduction in memory usage
- Support 500+ sites on same hardware
- Faster cold starts
- Reduced Docker image size

---

## 🔄 Stage 3: Redis Session Management (1 day)

**Impact: Shared state across workers, better scalability**

### Implementation Steps

#### 3.1 Add Redis Container
```yaml
# docker-compose.yml addition
redis:
  image: redis:7-alpine
  container_name: redis-sessions
  restart: always
  volumes:
    - /var/www/docker/redis-data:/data
  command: redis-server --appendonly yes
  networks:
    - app-network
```

#### 3.2 Implement Redis Session Store
```javascript
// lib/redis-session.js
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis',
  port: 6379,
  maxRetriesPerRequest: 3
});

export async function setSession(sessionId, data, ttl = 3600) {
  await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
}

export async function getSession(sessionId) {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}
```

#### 3.3 Update Authentication Flow
- Move JWT validation to Redis
- Share auth state across all workers
- Implement session invalidation

### Expected Results
- Consistent sessions across workers
- Horizontal scalability ready
- Reduced memory pressure
- Better session management

---

## 📊 Stage 4: Advanced Monitoring (2 days)

**Impact: Proactive issue detection, performance insights**

### Implementation Steps

#### 4.1 Add Prometheus Metrics
```javascript
// metrics.js
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code', 'site']
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['site']
});
```

#### 4.2 Implement Health Checks
- Memory usage monitoring
- Response time tracking
- Error rate monitoring
- Automatic alerts on thresholds

#### 4.3 Add APM Integration
- New Relic or DataDog integration
- Transaction tracing
- Database query analysis
- Real User Monitoring (RUM)

### Expected Results
- Early warning for issues
- Performance bottleneck identification
- Data-driven optimization decisions
- SLA monitoring

---

## 🏗️ Stage 5: Infrastructure Scaling (1 week)

**Impact: True horizontal scaling, 1000+ sites support**

### Implementation Steps

#### 5.1 Kubernetes Migration
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: astro-multi-tenant
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: astro
        image: your-registry/astro-multi-tenant
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

#### 5.2 Implement Service Mesh
- Istio or Linkerd for traffic management
- Circuit breakers
- Retry policies
- Load balancing strategies

#### 5.3 Multi-Region Deployment
- GeoDNS routing
- Regional caching
- Database replication
- CDN integration optimization

### Expected Results
- Unlimited horizontal scaling
- 99.99% availability
- Global performance optimization
- Automatic scaling based on load

---

## 🎯 Stage 6: Database Optimization (3 days)

**Impact: 10x query performance, better concurrency**

### Implementation Steps

#### 6.1 Connection Pooling
```javascript
// db/connection-pool.js
const poolSize = process.env.WORKER_ID ? 5 : 20; // Less connections per worker
const mongoOptions = {
  maxPoolSize: poolSize,
  minPoolSize: 2,
  maxIdleTimeMS: 10000
};
```

#### 6.2 Implement Read Replicas
- Separate read/write concerns
- Route analytics to replicas
- Implement eventual consistency handling

#### 6.3 Add Query Optimization
- Implement projection to reduce data transfer
- Add compound indexes for common queries
- Enable query result caching
- Implement aggregation pipelines

### Expected Results
- 10x improvement in query performance
- Better connection management
- Reduced database load
- Support for more concurrent users

---

## 📈 Performance Targets by Stage

| Stage | Sites Supported | Concurrent Users | Response Time (p95) | Availability |
|-------|----------------|------------------|---------------------|--------------|
| Current | 100 | 500 | 2000ms | 99% |
| Stage 1 | 800 | 4,000 | 500ms | 99.5% |
| Stage 2 | 1,500 | 8,000 | 400ms | 99.5% |
| Stage 3 | 2,000 | 10,000 | 350ms | 99.7% |
| Stage 4 | 2,000 | 10,000 | 300ms | 99.9% |
| Stage 5 | 10,000+ | 50,000+ | 200ms | 99.99% |
| Stage 6 | 10,000+ | 100,000+ | 150ms | 99.99% |

---

## 🚦 Quick Wins Checklist

Before starting staged implementation, apply these immediate optimizations:

- [ ] Enable Node.js production mode: `NODE_ENV=production`
- [ ] Increase Node heap size: `NODE_OPTIONS="--max-old-space-size=4096"`
- [ ] Enable gzip compression in nginx
- [ ] Add appropriate swap space (2x RAM)
- [ ] Optimize Docker logging (use json-file with max-size)
- [ ] Set appropriate file descriptor limits: `ulimit -n 65535`
- [ ] Enable HTTP/2 in nginx
- [ ] Implement nginx caching for static assets
- [ ] Add `Cache-Control` headers for assets

---

## 📊 Monitoring Metrics to Track

### Key Performance Indicators
- **Response Time**: p50, p95, p99 latencies
- **Throughput**: Requests per second
- **Error Rate**: 4xx and 5xx responses
- **Memory Usage**: Per worker and total
- **CPU Utilization**: Per core and average
- **Active Connections**: WebSocket and HTTP
- **Cache Hit Rate**: Redis and application cache
- **Database Performance**: Query time and connection pool usage

### Business Metrics
- **Site Load Time**: Time to first byte (TTFB)
- **Concurrent Sites Active**: Sites with traffic in last hour
- **Peak Traffic Handling**: Maximum concurrent users served
- **Deployment Frequency**: How often you can safely deploy
- **Mean Time to Recovery**: Average downtime when issues occur

---

## 🎬 Getting Started with Stage 1

1. **Backup Current Configuration**
   ```bash
   cp scripts/supervisor.conf scripts/supervisor.conf.backup
   cp Dockerfile Dockerfile.backup
   ```

2. **Create PM2 Configuration**
   ```bash
   # Create ecosystem.config.js as shown above
   ```

3. **Update Docker Image**
   ```bash
   # Add PM2 to Dockerfile
   # Update supervisor.conf
   # Rebuild and test locally
   ```

4. **Test Locally**
   ```bash
   docker build -t astro-multi-tenant:pm2-test .
   docker run -p 4321:4321 astro-multi-tenant:pm2-test
   # Run load tests
   ```

5. **Deploy to Staging**
   ```bash
   # Deploy to staging environment first
   # Monitor for 24 hours
   # Check metrics and logs
   ```

6. **Production Rollout**
   ```bash
   # Deploy during low-traffic period
   # Monitor closely for first hour
   # Have rollback plan ready
   ```

---

## 🔄 Rollback Plan

If issues arise during any stage:

1. **Immediate Rollback**
   ```bash
   # Revert to previous Docker image
   docker pull your-registry/astro-multi-tenant:previous
   docker stop current-container
   docker run previous-image
   ```

2. **Data Preservation**
   - All data in external volumes (safe)
   - No database schema changes in early stages
   - Configuration changes are reversible

3. **Monitoring During Rollback**
   - Watch error rates
   - Monitor response times
   - Check user sessions
   - Verify site availability

---

## 📚 Resources & References

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Node.js Cluster Module](https://nodejs.org/api/cluster.html)
- [Redis Best Practices](https://redis.io/docs/best-practices/)
- [Kubernetes Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [MongoDB Connection Pooling](https://www.mongodb.com/docs/manual/administration/connection-pool-overview/)

---

## ✅ Success Criteria

Stage 1 is considered successful when:
- [ ] All CPU cores are utilized effectively
- [ ] Zero-downtime deployments are working
- [ ] Memory usage is stable under load
- [ ] Response times improve by >50%
- [ ] Can handle 4x more concurrent requests
- [ ] Auto-restart on crashes is functioning
- [ ] Monitoring shows even load distribution

---

*Last Updated: November 2024*
*Next Review: After Stage 1 Implementation*