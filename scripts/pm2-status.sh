#!/bin/bash
# Helper script to check PM2 status and manage processes

case "$1" in
    status)
        echo "📊 PM2 Process Status:"
        pm2 list
        ;;
    monit)
        echo "📊 PM2 Real-time Monitor:"
        pm2 monit
        ;;
    logs)
        echo "📝 PM2 Logs (last 50 lines):"
        pm2 logs --lines 50
        ;;
    reload)
        echo "🔄 Gracefully reloading all PM2 processes..."
        pm2 reload all
        ;;
    restart)
        echo "♻️  Restarting all PM2 processes..."
        pm2 restart all
        ;;
    scale)
        if [ -z "$2" ]; then
            echo "Usage: $0 scale <number>"
            echo "Example: $0 scale 4"
            exit 1
        fi
        echo "⚖️  Scaling to $2 instances..."
        pm2 scale astro-multi-tenant $2
        ;;
    info)
        echo "ℹ️  PM2 Detailed Info:"
        pm2 info astro-multi-tenant
        ;;
    *)
        echo "Usage: $0 {status|monit|logs|reload|restart|scale|info}"
        echo ""
        echo "Commands:"
        echo "  status  - Show process list"
        echo "  monit   - Real-time monitoring"
        echo "  logs    - Show recent logs"
        echo "  reload  - Graceful reload (zero-downtime)"
        echo "  restart - Hard restart"
        echo "  scale   - Change number of instances"
        echo "  info    - Detailed process information"
        exit 1
        ;;
esac