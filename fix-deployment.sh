#!/bin/bash

echo "🔧 ALT-AI-MATE Deployment Fix Script"
echo "===================================="

# Check Node version
echo ""
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "Current Node.js version: $node_version"
echo "Required Node.js version: 18.17.1 (from .nvmrc)"

if [[ "$node_version" != "v18.17.1" ]]; then
    echo "⚠️  Warning: Node.js version mismatch!"
    echo "   Please switch to Node.js 18.17.1 using:"
    echo "   nvm use 18.17.1"
    echo ""
fi

# Test server locally
echo "🧪 Testing server locally..."
cd packages/server
if npm list express > /dev/null 2>&1; then
    echo "✅ Server dependencies are installed"
else
    echo "📦 Installing server dependencies..."
    npm install --no-audit --no-fund
fi

echo ""
echo "🚀 Starting server test..."
NODE_ENV=production PORT=3001 timeout 10s node src/index.js &
server_pid=$!
sleep 3

# Test health endpoint
echo "🔍 Testing health endpoint..."
health_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")

if [ "$health_status" = "200" ]; then
    echo "✅ Server health check: PASSED"
else
    echo "❌ Server health check: FAILED (HTTP $health_status)"
fi

# Test projects endpoint
echo "🔍 Testing projects endpoint..."
project_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/projects \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","projectType":"web"}' 2>/dev/null || echo "000")

if [ "$project_status" = "201" ]; then
    echo "✅ Projects endpoint: PASSED"
else
    echo "❌ Projects endpoint: FAILED (HTTP $project_status)"
fi

# Stop test server
kill $server_pid 2>/dev/null
wait $server_pid 2>/dev/null

cd ../..

# Test client build
echo ""
echo "🏗️  Testing client build..."
cd packages/client

if npm list vite > /dev/null 2>&1; then
    echo "✅ Client dependencies are installed"
else
    echo "📦 Installing client dependencies..."
    npm install --no-audit --no-fund
fi

echo "🔨 Building client..."
if npm run build; then
    echo "✅ Client build: PASSED"
    echo "📁 Build output in: packages/client/dist"
else
    echo "❌ Client build: FAILED"
fi

cd ../..

echo ""
echo "📋 Deployment Configuration Summary:"
echo "======================================"
echo "✅ Netlify config: netlify.toml"
echo "   - Base: packages/client"
echo "   - Build: npm install && npm run build"
echo "   - Publish: dist"
echo "   - Node version: 18.17.1"
echo ""
echo "✅ Render config: packages/server/render.yaml"
echo "   - Build: cd packages/server && npm install --production"
echo "   - Start: cd packages/server && node src/index.js"
echo "   - Port: 10000 (Render default)"
echo "   - Node version: 18.17.1"
echo ""
echo "🌐 URLs:"
echo "   Frontend: https://alt-ai-mate.netlify.app"
echo "   Backend:  https://alt-ai-mate.onrender.com"
echo ""
echo "🔧 Next Steps:"
echo "1. Commit and push these changes to your repository"
echo "2. Redeploy on Netlify (should auto-deploy on push)"
echo "3. Redeploy on Render (manual redeploy may be needed)"
echo "4. Run './deploy-status.sh' to check deployment status"