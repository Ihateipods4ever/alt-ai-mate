#!/bin/bash

echo "🚀 Deploying ALT-AI-MATE Updates"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all changes
echo "📝 Adding all changes to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Add comprehensive functionality updates

- Enhanced project types (games, social media, etc.)
- Functional servers management page
- IP Guard application system
- Complete billing and subscription management
- User authentication and context management
- Protected routes and state persistence
- Enhanced dashboard with real project data
- Improved editor with better preview
- Server API enhancements

All features now fully functional and integrated."

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ No Git remote configured!"
    echo "Please set up your Git repository first:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run this script again"
    exit 1
fi

# Push to main branch
echo "🚀 Pushing to main branch..."
git push origin main

echo ""
echo "✅ Code pushed to repository!"
echo ""
echo "🔄 Deployment Status:"
echo "- Netlify will automatically deploy the frontend from the main branch"
echo "- Render will automatically deploy the backend from the main branch"
echo ""
echo "⏳ Please wait 2-3 minutes for deployments to complete, then check:"
echo "Frontend: https://alt-aimate.netlify.app"
echo "Backend: https://alt-ai-mate.onrender.com/api/health"
echo ""
echo "🔍 You can monitor deployment status by running:"
echo "./deploy-status.sh"