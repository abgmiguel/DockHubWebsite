module.exports = {
  apps: [{
    name: 'astro-multi-tenant',
    script: '/app/dist/server/entry.mjs',
    cwd: '/app',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    watch: false, // Watcher script handles this
    max_memory_restart: '1G',
    wait_ready: true,
    listen_timeout: 3000,
    kill_timeout: 5000,
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: process.env.PORT || 4321,
      API_PORT: process.env.API_PORT || 3001,
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      PUBLIC_API_URL: process.env.PUBLIC_API_URL
    },
    
    // Logging
    error_file: '/var/log/pm2/error.log',
    out_file: '/var/log/pm2/out.log',
    merge_logs: true,
    time: true,
    
    // Cluster settings
    instance_var: 'INSTANCE_ID',
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    
    // Graceful shutdown
    shutdown_with_message: true,
    
    // Performance optimizations
    node_args: '--max-old-space-size=1024'
  }]
};