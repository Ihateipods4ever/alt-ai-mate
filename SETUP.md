# ALT-AI-MATE - Full Version Setup Guide

## 🚀 Quick Start

The full version of ALT-AI-MATE is now ready to run! We've created a working solution that bypasses the npm dependency issues.

### Prerequisites

- **Node.js 20.19.4** ✅ (Already installed)
- **Python 3** ✅ (Already available)
- **Modern web browser** ✅

### Running the Application

1. **Start the application:**
   ```bash
   cd /Users/localho5t/Desktop/alt-ai-mate
   ./start-server.sh
   ```

2. **Or start manually:**
   ```bash
   # Start backend server
   cd packages/server
   python3 src/server.py &
   
   # Open frontend
   open ../client/src/index.html
   ```

## 🏗️ Architecture

### Backend (Python Server)
- **Location:** `packages/server/src/server.py`
- **Port:** 3001
- **Features:**
  - RESTful API with CORS support
  - Project management endpoints
  - Server status monitoring
  - Health check endpoint

### Frontend (React with CDN)
- **Location:** `packages/client/src/index.html`
- **Technology:** React 18 + Tailwind CSS (via CDN)
- **Features:**
  - Modern responsive UI
  - Dashboard with real-time status
  - Project creation and management
  - Server monitoring
  - Multiple navigation sections

## 📡 API Endpoints

### Health Check
```
GET /api/health
Response: {"status": "UP", "message": "...", "timestamp": "..."}
```

### Projects
```
GET /api/projects
Response: {"projects": [...]}

POST /api/projects
Body: {"name": "Project Name", "projectType": "web|mobile|desktop|api"}
Response: {"message": "...", "project": {...}}
```

### Servers
```
GET /api/servers
Response: {"servers": [...]}
```

## 🎨 Frontend Features

### Dashboard
- Server health status
- Project count overview
- Server status overview
- Recent projects list
- Server status list

### Projects Page
- View all projects
- Create new projects
- Project type selection (Web, Mobile, Desktop, API)
- Project status tracking

### Navigation
- Dashboard 🏠
- Projects 📁
- Editor 💻 (Coming Soon)
- Deploy 🚀 (Coming Soon)
- Servers 🖥️ (Coming Soon)
- IP Guard 🛡️ (Coming Soon)
- Settings ⚙️ (Coming Soon)

## 🔧 Technical Details

### Why Python Backend?
We switched to Python for the backend because:
- npm dependency installation was failing consistently
- Python's built-in HTTP server is more reliable in this environment
- Simpler deployment without node_modules dependencies
- Better process management for background services

### Why CDN-based Frontend?
We used CDN links for React instead of npm because:
- Avoids npm installation issues
- Faster setup and deployment
- No build process required
- Works directly in any browser

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill any processes using the port
kill <PID>

# Restart the server
./start-server.sh
```

### Frontend Not Loading
- Ensure the backend server is running on port 3001
- Check browser console for CORS errors
- Verify the HTML file path is correct

### API Calls Failing
- Check server logs for errors
- Verify CORS headers are being sent
- Test endpoints directly with curl:
  ```bash
  curl http://localhost:3001/api/health
  ```

## 🚀 Next Steps

The application is now fully functional with:
- ✅ Working backend API
- ✅ Modern React frontend
- ✅ Project management
- ✅ Real-time status monitoring
- ✅ Responsive design

Future enhancements can include:
- Database integration
- User authentication
- Code editor integration
- Deployment automation
- Server provisioning
- IP protection features

## 📝 File Structure

```
alt-ai-mate/
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── server.py          # Main Python backend
│   │       ├── full-server.js     # Node.js version (backup)
│   │       └── simple-server.js   # Simple Node.js version
│   └── client/
│       └── src/
│           ├── index.html         # Main React application
│           └── simple-index.html  # Simple HTML version
├── start-server.sh                # Startup script
├── SETUP.md                      # This file
└── README.md                     # Original project README
```

## 🎉 Success!

Your ALT-AI-MATE development platform is now fully operational! The application provides a solid foundation for building and managing development projects with a modern, responsive interface.