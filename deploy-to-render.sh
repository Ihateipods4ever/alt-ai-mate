#!/bin/bash

# Deploy ALT-AI-MATE Backend to Render
echo "🚀 Deploying ALT-AI-MATE Backend to Render..."

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

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing latest changes..."
    git add .
    git commit -m "Deploy: Updated configuration for Render deployment"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🔗 Next steps:"
echo "1. Go to https://render.com"
echo "2. Connect your GitHub repository"
echo "3. Create a new Web Service"
echo "4. Use the render.yaml configuration in packages/server/"
echo "5. Set your environment variables:"
echo "   - OPENAI_API_KEY (optional)"
echo "   - STRIPE_SECRET_KEY (optional)"
echo "   - DATABASE_URL (optional)"
echo ""
echo "📋 Your backend will be available at: https://alt-ai-mate-backend.onrender.com"