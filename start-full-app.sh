#!/bin/bash

echo "🚀 Starting ALT-AI-MATE Full React TypeScript Application..."
 
# --- Node.js Version Check ---
# A more robust check to find and use nvm if it exists.
NVM_SH_PATH=""
if [ -s "$HOME/.nvm/nvm.sh" ]; then # Standard nvm install path
    NVM_SH_PATH="$HOME/.nvm/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then # Homebrew nvm install path
    export NVM_DIR="$HOME/.nvm" # nvm.sh needs NVM_DIR to be set
    [ ! -d "$NVM_DIR" ] && mkdir -p "$NVM_DIR" # Create .nvm directory if it doesn't exist
    NVM_SH_PATH="/usr/local/opt/nvm/nvm.sh"
fi

if [ -n "$NVM_SH_PATH" ]; then
    echo "✅ Found nvm, attempting to set Node.js version from .nvmrc..."
    . "$NVM_SH_PATH" # Source nvm
    nvm use # Use the version specified in .nvmrc
    if [ $? -ne 0 ]; then # Check if nvm use failed
      echo "❌ 'nvm use' failed. The required Node.js version (from .nvmrc) might not be installed."
      read -p "➡️ Would you like to run 'nvm install' to install it now? (y/n) " -n 1 -r
      echo # Move to a new line
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        nvm install # This will install the version from .nvmrc
        nvm use # Try to use it again after installation, in case the first one failed
      else
        echo "Aborting. Please install Node.js v20 manually and try again."
        exit 1
      fi
    fi
    echo "✅ Successfully set Node version to: $(node -v)"
fi
# --- End Node.js Version Check ---

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
