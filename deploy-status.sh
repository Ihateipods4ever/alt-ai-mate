#!/bin/bash

echo "🚀 ALT-AI-MATE Deployment Status Check"
echo "======================================"

echo ""
echo "📡 Checking Backend (Render)..."
echo "URL: https://alt-ai-mate.onrender.com/api/health"

# Check backend health
backend_status=$(curl -s -o /dev/null -w "%{http_code}" https://alt-ai-mate.onrender.com/api/health 2>/dev/null || echo "000")

if [ "$backend_status" = "200" ]; then
    echo "✅ Backend: ONLINE"
    echo "Testing project creation endpoint..."
    # Test the /api/projects endpoint since /api/generate-code was removed
    curl -s -X POST https://alt-ai-mate.onrender.com/api/projects \
         -H "Content-Type: application/json" \
         -d '{"name":"Deployment Test","projectType":"web"}' | head -c 200
    echo "..."
elif [ "$backend_status" = "503" ]; then
    echo "🔄 Backend: STARTING UP (Service Unavailable)"
else
    echo "❌ Backend: OFFLINE (HTTP $backend_status)"
fi

echo ""
echo "🌐 Checking Frontend (Netlify)..."
echo "URL: https://alt-aimate.netlify.app"

# Check frontend
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://alt-aimate.netlify.app 2>/dev/null || echo "000")

if [ "$frontend_status" = "200" ]; then
    echo "✅ Frontend: ONLINE"
elif [ "$frontend_status" = "404" ]; then
    echo "❌ Frontend: NOT FOUND (Deployment may have failed)"
else
    echo "❌ Frontend: OFFLINE (HTTP $frontend_status)"
fi

echo ""
echo "📋 Deployment Summary:"
echo "Backend Status: $backend_status"
echo "Frontend Status: $frontend_status"

if [ "$backend_status" = "200" ] && [ "$frontend_status" = "200" ]; then
    echo "🎉 Both services are ONLINE!"
elif [ "$backend_status" = "503" ]; then
    echo "⏳ Backend is still starting up. Please wait a few more minutes."
else
    echo "⚠️  One or both services need attention."
fi