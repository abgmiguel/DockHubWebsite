#!/usr/bin/env node

// Astro SSR Server Runner for Docker
// This script starts the Astro SSR server from the built dist directory

const path = require('path');

// Get site name from environment or command line
const siteName = process.env.SITE_NAME || process.argv[2];
if (!siteName) {
  console.error('Error: SITE_NAME environment variable or argument required');
  process.exit(1);
}

// Get port from environment or use default
const port = parseInt(process.env.PORT || '4321');
const host = process.env.HOST || '0.0.0.0';

// Path to the Astro server entry
const serverPath = path.join('/app/sites', siteName, 'server', 'entry.mjs');

console.log(`Starting Astro SSR server for ${siteName}`);
console.log(`Server path: ${serverPath}`);
console.log(`Listening on ${host}:${port}`);

// Set environment variables for Astro
process.env.HOST = host;
process.env.PORT = port.toString();
process.env.PUBLIC_API_URL = process.env.API_URL || 'http://127.0.0.1:3001';

// Import and start the server
import(serverPath).then(module => {
  if (module.startServer) {
    // Astro standalone mode with startServer function
    module.startServer();
    console.log(`✓ ${siteName} server started on port ${port}`);
  } else if (module.handler) {
    // Fallback to creating our own server with the handler
    const http = require('http');
    const server = http.createServer(module.handler);
    server.listen(port, host, () => {
      console.log(`✓ ${siteName} server started on ${host}:${port}`);
    });
  } else {
    console.error('Error: No startServer or handler function found in server entry');
    process.exit(1);
  }
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});