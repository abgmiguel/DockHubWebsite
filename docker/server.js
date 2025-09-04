const express = require('express');
const httpProxy = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();

// Load sites configuration
const sites = JSON.parse(fs.readFileSync('/app/sites-config.json', 'utf8'));

// API proxy to backend
app.use('/api', httpProxy.createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Get hostname
    const hostname = req.hostname || req.headers.host?.split(':')[0] || 'default';
    const siteConfig = sites[hostname] || sites['default'];
    
    // Add tenant information
    proxyReq.setHeader('X-Tenant-Domain', hostname);
    proxyReq.setHeader('X-Tenant-Id', siteConfig.id);
    proxyReq.setHeader('X-Site-Database', siteConfig.database);
  }
}));

// Uploads - shared across all sites
app.use('/uploads', express.static('/app/uploads'));

// Frontend routing based on domain
app.use((req, res, next) => {
  const hostname = req.hostname || req.headers.host?.split(':')[0] || 'default';
  const siteConfig = sites[hostname] || sites['default'];
  
  if (!siteConfig) {
    return res.status(404).send('Site not found');
  }
  
  const sitePath = path.join('/app/sites', siteConfig.directory);
  
  // Check if site directory exists
  if (!fs.existsSync(sitePath)) {
    console.error(`Site path not found: ${sitePath}`);
    return res.status(404).send('Site not configured');
  }
  
  // Serve site's static files
  express.static(sitePath, {
    fallthrough: false,
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  })(req, res, (err) => {
    // For SPAs, serve index.html for any route
    if (err && err.statusCode === 404) {
      const indexPath = path.join(sitePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next(err);
      }
    } else {
      next(err);
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      backend: 'running',
      mongodb: 'running',
      sites: Object.keys(sites).length
    }
  });
});

const PORT = process.env.PORT || 8000;  // Run on high port, not 80
app.listen(PORT, () => {
  console.log(`Multi-site server running on port ${PORT}`);
  console.log('Configured sites:', Object.keys(sites));
});