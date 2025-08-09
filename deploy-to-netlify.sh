#!/bin/bash

# Deploy ALT-AI-MATE Frontend to Netlify
echo "🌐 Deploying ALT-AI-MATE Frontend to Netlify..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    echo "   git push -u origin main"
    exit 1
fi

# Test build locally first
echo "🔧 Testing build locally..."
cd packages/client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Local build failed! Please fix build errors first."
    exit 1
fi
cd ../..

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing latest changes..."
    git add .
    git commit -m "Deploy: Updated configuration for Netlify deployment"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🔗 Next steps:"
echo "1. Go to https://netlify.com"
echo "2. Click 'New site from Git'"
echo "3. Connect your GitHub repository"
echo "4. Netlify will automatically use the netlify.toml configuration"
echo "5. Set your environment variables in Netlify dashboard:"
echo "   - VITE_API_URL=https://your-render-backend-url.onrender.com"
echo "   - VITE_STRIPE_PUBLISHABLE_KEY (optional)"
echo ""
echo "📋 Your frontend will be available at: https://your-site-name.netlify.app"