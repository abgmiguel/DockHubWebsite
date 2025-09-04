const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8000;

// Load sites configuration
const sites = JSON.parse(fs.readFileSync('/app/sites-config.json', 'utf8'));

// Map sites to their running servers
const siteServers = {
  'codersinflow.com': 'http://127.0.0.1:4321',
  'darkflows.com': 'http://127.0.0.1:4322',
  'localhost': 'http://127.0.0.1:4321', // Default to codersinflow for localhost
  'default': 'http://127.0.0.1:4321'
};

// API proxy to backend with tenant headers
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:3001',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Get hostname
    const hostname = req.hostname || req.headers.host?.split(':')[0] || 'default';
    const siteConfig = sites[hostname] || sites['default'] || {};
    
    // Add tenant information headers
    proxyReq.setHeader('X-Tenant-Domain', hostname);
    proxyReq.setHeader('X-Tenant-Id', siteConfig.id || 'default');
    proxyReq.setHeader('X-Site-Database', siteConfig.database || 'default_db');
    
    console.log(`API request from ${hostname} to ${req.url}`);
  }
}));

// Uploads - shared across all sites (serve from filesystem)
app.use('/uploads', express.static('/app/uploads'));

// Main routing - proxy to appropriate Astro server based on domain
app.use((req, res, next) => {
  const hostname = req.hostname || req.headers.host?.split(':')[0] || 'default';
  
  // Handle www prefix
  const normalizedHost = hostname.replace(/^www\./, '');
  
  // Get the target server for this hostname
  const targetServer = siteServers[normalizedHost] || siteServers[hostname] || siteServers['default'];
  
  if (!targetServer) {
    return res.status(404).send('Site not found');
  }
  
  console.log(`Routing ${hostname} (${req.url}) → ${targetServer}`);
  
  // Proxy to the appropriate Astro server
  createProxyMiddleware({
    target: targetServer,
    changeOrigin: true,
    ws: true, // Enable WebSocket support for HMR in dev
    onError: (err, req, res) => {
      console.error(`Proxy error for ${hostname}:`, err.message);
      res.status(502).send('Bad Gateway - Site server not available');
    }
  })(req, res, next);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Multi-tenant proxy server running on port ${port}`);
  console.log('Site mappings:', siteServers);
  console.log('Ready to route requests!');
});