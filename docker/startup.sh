#!/bin/bash
set -e

echo "Starting all-in-one container initialization..."

# Create necessary directories
mkdir -p /data/db /var/log/supervisor /app/uploads /app/logs

# Initialize MongoDB if not already initialized
if [ ! -f /data/db/.mongodb_initialized ]; then
    echo "Initializing MongoDB..."
    
    # Start MongoDB without auth first
    mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /var/log/mongodb_init.log
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to start..."
    for i in {1..30}; do
        if mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    # Create admin user and database
    echo "Creating MongoDB users..."
    mongosh admin --eval "
        db.createUser({
            user: 'admin',
            pwd: '$MONGO_PASSWORD',
            roles: [
                { role: 'userAdminAnyDatabase', db: 'admin' },
                { role: 'readWriteAnyDatabase', db: 'admin' }
            ]
        });
    "
    
    # Create application database and user
    mongosh admin -u admin -p "$MONGO_PASSWORD" --eval "
        use codersblog;
        db.createUser({
            user: 'bloguser',
            pwd: '$MONGO_PASSWORD',
            roles: [
                { role: 'readWrite', db: 'codersblog' }
            ]
        });
    "
    
    # Stop MongoDB to restart with auth
    mongosh admin -u admin -p "$MONGO_PASSWORD" --eval "db.shutdownServer()"
    
    # Wait for MongoDB to stop
    sleep 2
    
    # Mark as initialized
    touch /data/db/.mongodb_initialized
    echo "MongoDB initialization complete"
fi

# Ensure proper permissions
chown -R mongodb:mongodb /data/db 2>/dev/null || true
chown -R www-data:www-data /app/uploads 2>/dev/null || true
chown -R www-data:www-data /app/dist 2>/dev/null || true

# No nginx in container - host handles it

# Admin user will be created by init-admin binary after MongoDB starts

# Set Node.js options if not already set
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096 --trace-warnings}"
export ASTRO_TELEMETRY_DISABLED=1

# Set Go options if not already set
export GOMAXPROCS="${GOMAXPROCS:-4}"
export GOGC="${GOGC:-100}"

# Start all services with supervisor
echo "Starting all services with supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf