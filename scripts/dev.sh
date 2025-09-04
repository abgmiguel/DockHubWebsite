#!/bin/bash

# Start development environment
set -e

echo "🚀 Starting Multi-Tenant Development Environment"
echo "================================================"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Killing existing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Load configuration from .env if it exists
if [ -f ".env" ]; then
    echo "Loading configuration from .env..."
    # Remove comments (both lines starting with # and inline comments)
    # and export only valid variable assignments
    set -a
    source <(grep -v '^#' .env | sed 's/#.*//')
    set +a
fi

# Use environment variables or defaults
BACKEND_PORT="${API_PORT:-3001}"
FRONTEND_PORT="${PORT:-4321}"
MONGODB_PORT="${MONGODB_PORT:-27017}"
API_URL="${PUBLIC_API_URL:-http://127.0.0.1:3001}"
MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/codersblog}"

# Try app-config.json as fallback for backward compatibility
if [ -f "app-config.json" ]; then
    BACKEND_PORT=${BACKEND_PORT:-$(jq -r '.server.ports.backend' app-config.json)}
    FRONTEND_PORT=${FRONTEND_PORT:-$(jq -r '.server.ports.frontend' app-config.json)}
    MONGODB_PORT=${MONGODB_PORT:-$(jq -r '.server.ports.mongodb' app-config.json)}
    API_URL=${API_URL:-$(jq -r '.urls.api' app-config.json)}
    MONGODB_URI=${MONGODB_URI:-$(jq -r '.urls.mongodb' app-config.json)}
fi

# Clean up existing processes on our ports
echo "🧹 Cleaning up existing processes..."
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Also kill any lingering Go server processes from this project
pkill -f "backend/cmd/server/main.go" 2>/dev/null || true
# Kill the compiled binary if it's running
if [ -f "backend/main" ]; then
    pkill -f "backend/main" 2>/dev/null || true
fi

# Start MongoDB if not running
if docker ps -a | grep -q mongodb-dev; then
    if ! docker ps | grep -q mongodb-dev; then
        echo "📦 Starting existing MongoDB container on port $MONGODB_PORT..."
        docker start mongodb-dev
        sleep 2
    else
        echo "✓ MongoDB already running on port $MONGODB_PORT"
    fi
else
    echo "📦 Creating and starting MongoDB on port $MONGODB_PORT..."
    docker run -d --name mongodb-dev -p $MONGODB_PORT:$MONGODB_PORT mongo:7.0
    sleep 2
fi

# Start Backend
echo "🔧 Starting Backend API on port $BACKEND_PORT..."
cd backend
MONGODB_URI="$MONGODB_URI" PORT=$BACKEND_PORT go run cmd/server/main.go &
BACKEND_PID=$!
sleep 2

# Start Frontend
echo "🎨 Starting Frontend SSR on port $FRONTEND_PORT..."
cd ../astro-multi-tenant
PUBLIC_API_URL=$API_URL PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System Ready!"
echo "================"
echo ""
echo "📍 Default site: http://127.0.0.1:$FRONTEND_PORT"
echo "📝 Blog: http://127.0.0.1:$FRONTEND_PORT/blog"
echo ""
echo "🌐 Test different sites (no /etc/hosts needed!):"
echo "   • http://codersinflow.localhost:$FRONTEND_PORT (blue theme)"
echo "   • http://darkflows.localhost:$FRONTEND_PORT (red theme)"
echo ""
echo "💡 Tip: .localhost domains work automatically in modern browsers!"
echo ""
echo "Press Ctrl+C to stop"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    # Kill backend process
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        echo "   Stopping backend..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Kill frontend process
    if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   Stopping frontend..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Also kill by port in case PIDs don't work
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    echo "✅ Cleanup complete"
    exit 0
}

# Set up trap for clean exit
trap cleanup EXIT INT TERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID