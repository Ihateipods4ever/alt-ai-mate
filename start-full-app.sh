#!/bin/bash

echo "🚀 Starting ALT-AI-MATE Full React TypeScript Application..."

# Set Node.js path
export PATH="/usr/local/Cellar/node@20/20.19.4/bin:$PATH"

# Kill any existing server processes
echo "Stopping any existing servers..."
pkill -f "python3 src/server.py" 2>/dev/null || true
pkill -f "node src/" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

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

# Start the React TypeScript frontend
echo "Starting React TypeScript frontend..."
cd ../client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start the Vite development server
echo "Starting Vite development server..."
npm run dev &
VITE_PID=$!

# Wait for Vite to start
sleep 5

echo ""
echo "🎉 ALT-AI-MATE Full Application is now running!"
echo ""
echo "Backend API: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Available API endpoints:"
echo "  GET  /api/health - Health check"
echo "  GET  /api/projects - List projects"
echo "  POST /api/projects - Create project"
echo "  GET  /api/servers - List servers"
echo ""
echo "Press Ctrl+C to stop both servers"

# Keep the script running and handle Ctrl+C
trap 'echo ""; echo "Shutting down..."; kill $SERVER_PID $VITE_PID 2>/dev/null || true; exit 0' INT

# Wait for both processes
wait $SERVER_PID $VITE_PID