#!/bin/bash

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
else
    echo "⚠️ nvm not found. Proceeding with system's default Node.js."
    echo "If you encounter errors, please install nvm or ensure Node.js v20 is your default."
fi
# --- End Node.js Version Check ---

echo "🚀 Starting ALT-AI-MATE Development Platform..."

# Kill any existing server and client processes
echo "Stopping any processes on ports 3001 (backend) and 5173 (frontend)..."
BACKEND_PIDS=$(lsof -t -i:3001)
FRONTEND_PIDS=$(lsof -t -i:5173)

[ ! -z "$BACKEND_PIDS" ] && echo "Killing backend process(es) on port 3001: $BACKEND_PIDS" && kill -9 $BACKEND_PIDS 2>/dev/null
[ ! -z "$FRONTEND_PIDS" ] && echo "Killing frontend process(es) on port 5173: $FRONTEND_PIDS" && kill -9 $FRONTEND_PIDS 2>/dev/null

# Wait a moment for processes to stop
sleep 2

# Start the Node.js backend server
echo "Starting backend server..."
(cd packages/server && npm run dev > ../server-output.log 2>&1 &)
BACKEND_PID=$!

# Start the Vite development server for the frontend
echo "Starting frontend development server..."
CLIENT_DIR="packages/client"
if [ ! -d "$CLIENT_DIR/node_modules" ]; then
    echo "Frontend dependencies not found. Running npm install in $CLIENT_DIR..."
    (cd "$CLIENT_DIR" && npm install)
(cd "$CLIENT_DIR" && export VITE_API_URL=http://localhost:3001 && npm run dev > ../client-output.log 2>&1 &)
VITE_PID=$!

# A more robust function to wait for a server to be available
wait_for_server() {
  local url=$1
  local service_name=$2
  echo "Waiting for $service_name to be available at $url..."
  for i in {1..20}; do # Try for 20 seconds
    if curl -s --head --fail "$url" > /dev/null; then
      echo "✅ $service_name is running successfully on $url"
      return 0
    fi
    sleep 1
  done
  echo "❌ $service_name failed to start in time."
  return 1
}

# Wait for and test both servers
if ! wait_for_server http://localhost:3001/api/health "Backend"; then
    kill $BACKEND_PID $VITE_PID 2>/dev/null || true; exit 1;
fi
if ! wait_for_server http://localhost:5173 "Frontend"; then
    kill $BACKEND_PID $VITE_PID 2>/dev/null || true; exit 1;
fi

# Open the frontend in the browser
echo "Opening frontend application in browser..."
open http://localhost:5173

echo ""
echo "🎉 ALT-AI-MATE is now running!"
echo ""
echo "Backend API: http://localhost:3001"
echo "Frontend App: http://localhost:5173"
echo ""
echo "Available API endpoints:"
echo "  GET  /api/health - Health check"
echo "  GET  /api/projects - List projects"
echo "  POST /api/projects - Create project"
echo "  GET  /api/servers - List servers"
echo ""
echo "Press Ctrl+C to stop the server"

# Function to clean up background processes
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $VITE_PID 2>/dev/null || true
  exit 0
}
# Keep the script running and handle Ctrl+C
trap cleanup INT

# Wait for the server process
wait $BACKEND_PID $VITE_PID