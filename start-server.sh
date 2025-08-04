#!/bin/bash

echo "🚀 Starting ALT-AI-MATE Development Platform..."

# Kill any existing server processes
echo "Stopping any existing servers..."
pkill -f "python3 src/server.py" 2>/dev/null || true
pkill -f "node src/" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Start the Python backend server
echo "Starting backend server..."
cd packages/server
python3 src/server.py &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test server health
echo "Testing server health..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend server is running successfully on http://localhost:3001"
else
    echo "❌ Backend server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Open the frontend
echo "Opening frontend application..."
open ../client/src/index.html

echo ""
echo "🎉 ALT-AI-MATE is now running!"
echo ""
echo "Backend API: http://localhost:3001"
echo "Frontend: Opening in your default browser"
echo ""
echo "Available API endpoints:"
echo "  GET  /api/health - Health check"
echo "  GET  /api/projects - List projects"
echo "  POST /api/projects - Create project"
echo "  GET  /api/servers - List servers"
echo ""
echo "Press Ctrl+C to stop the server"

# Keep the script running and handle Ctrl+C
trap 'echo ""; echo "Shutting down..."; kill $SERVER_PID 2>/dev/null || true; exit 0' INT

# Wait for the server process
wait $SERVER_PID