const http = require('http');
const url = require('url');
const querystring = require('querystring');

const port = 3001;

// Simple CORS middleware
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Simple JSON response helper
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Simple body parser for POST requests
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    setCORSHeaders(res);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Health check endpoint
    if (pathname === '/api/health' && method === 'GET') {
      sendJSON(res, 200, { 
        status: 'UP', 
        message: 'ALT-AI-MATE server is running smoothly.',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Projects endpoint
    if (pathname === '/api/projects' && method === 'POST') {
      parseBody(req, (error, data) => {
        if (error) {
          sendJSON(res, 400, { error: 'Invalid JSON in request body' });
          return;
        }

        const { name, projectType } = data;
        
        if (!name || !projectType) {
          sendJSON(res, 400, { error: 'Missing required fields: name and projectType' });
          return;
        }

        console.log('Received new project:', { name, projectType });
        
        const project = {
          id: Date.now(),
          name,
          projectType,
          status: 'Created',
          createdAt: new Date().toISOString()
        };

        sendJSON(res, 201, { 
          message: 'Project created successfully', 
          project 
        });
      });
      return;
    }

    // Get projects endpoint (mock data)
    if (pathname === '/api/projects' && method === 'GET') {
      const mockProjects = [
        {
          id: 1,
          name: 'Sample Web App',
          projectType: 'web',
          status: 'Active',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Mobile App Demo',
          projectType: 'mobile',
          status: 'In Development',
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ];
      
      sendJSON(res, 200, { projects: mockProjects });
      return;
    }

    // Servers endpoint (mock data)
    if (pathname === '/api/servers' && method === 'GET') {
      const mockServers = [
        {
          id: 1,
          provider: 'AWS',
          serverType: 't3.micro',
          status: 'Running',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          provider: 'DigitalOcean',
          serverType: 'Basic',
          status: 'Provisioning',
          createdAt: '2024-01-03T00:00:00.000Z'
        }
      ];
      
      sendJSON(res, 200, { servers: mockServers });
      return;
    }

    // Default 404 response
    sendJSON(res, 404, { 
      error: 'Not found',
      path: pathname,
      method: method
    });

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
  }
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/projects - List projects`);
  console.log(`  POST /api/projects - Create project`);
  console.log(`  GET  /api/servers - List servers`);
});