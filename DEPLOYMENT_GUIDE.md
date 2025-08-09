# 🚀 ALT-AI-MATE Deployment Guide

## Prerequisites
1. GitHub account
2. Render account (free tier available)
3. Netlify account (free tier available)

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/alt-ai-mate.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Render

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `alt-ai-mate-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --workspace=packages/server && npm run build --workspace=packages/server`
   - **Start Command**: `npm start --workspace=packages/server`
   - **Node Version**: `18.17.1`

5. Set Environment Variables in Render Dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   NODE_VERSION=18.17.1
   
   # Optional - Add these if you want AI features
   OPENAI_API_KEY=<your-openai-api-key>
   
   # Optional - Add these if you want payment features
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PRO_PRICE_ID=<your-stripe-pro-price-id>
   STRIPE_ENTERPRISE_PRICE_ID=<your-stripe-enterprise-price-id>
   
   # Optional - Add database if needed
   DATABASE_URL=<your-database-url>
   ```

6. Deploy! Your backend will be available at: `https://alt-ai-mate-backend.onrender.com`

### 3. Deploy Frontend to Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Netlify will automatically detect the `netlify.toml` configuration
5. Set Environment Variables in Netlify Dashboard:
   ```
   VITE_API_URL=https://alt-ai-mate-backend.onrender.com
   
   # Optional - Add if you want Stripe payments
   VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   ```

6. Deploy! Your frontend will be available at: `https://your-site-name.netlify.app`

## 🔧 Configuration Files

### Backend (Render)
- Configuration: `packages/server/render.yaml`
- Build output: `packages/server/dist/`
- Entry point: `dist/index.js`

### Frontend (Netlify)
- Configuration: `netlify.toml`
- Build output: `packages/client/dist/`
- Entry point: `dist/index.html`

## 🌍 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
DATABASE_URL=your_db_url_here
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=your_key_here
```

## 🚨 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (should be 18.17.1)
2. **API not connecting**: Verify VITE_API_URL in Netlify
3. **CORS errors**: Backend should allow your Netlify domain
4. **Environment variables**: Double-check all required vars are set

### Build Commands:
```bash
# Test builds locally
npm run build --workspace=packages/server  # Backend
npm run build --workspace=packages/client  # Frontend

# Full deployment test
./build-and-deploy.sh
```

## 📞 Support
If you encounter issues, check the build logs in Render/Netlify dashboards.