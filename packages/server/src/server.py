#!/usr/bin/env python3
import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime
import threading
import time

class ALTAIMateHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                'status': 'UP',
                'message': 'ALT-AI-MATE server is running smoothly.',
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/api/projects':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            projects = [
                {
                    'id': 1,
                    'name': 'Sample Web App',
                    'projectType': 'web',
                    'status': 'Active',
                    'createdAt': '2024-01-01T00:00:00.000Z'
                },
                {
                    'id': 2,
                    'name': 'Mobile App Demo',
                    'projectType': 'mobile',
                    'status': 'In Development',
                    'createdAt': '2024-01-02T00:00:00.000Z'
                }
            ]
            response = {'projects': projects}
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/api/servers':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            servers = [
                {
                    'id': 1,
                    'provider': 'AWS',
                    'serverType': 't3.micro',
                    'status': 'Running',
                    'createdAt': '2024-01-01T00:00:00.000Z'
                },
                {
                    'id': 2,
                    'provider': 'DigitalOcean',
                    'serverType': 'Basic',
                    'status': 'Provisioning',
                    'createdAt': '2024-01-03T00:00:00.000Z'
                }
            ]
            response = {'servers': servers}
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': 'Not found', 'path': self.path}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        
        if self.path == '/api/projects':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                name = data.get('name')
                project_type = data.get('projectType')
                
                if not name or not project_type:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    response = {'error': 'Missing required fields: name and projectType'}
                    self.wfile.write(json.dumps(response).encode())
                    return
                
                project = {
                    'id': int(time.time() * 1000),
                    'name': name,
                    'projectType': project_type,
                    'status': 'Created',
                    'createdAt': datetime.now().isoformat()
                }
                
                self.send_response(201)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'message': 'Project created successfully',
                    'project': project
                }
                self.wfile.write(json.dumps(response).encode())
                print(f"Created project: {name} ({project_type})")
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'error': 'Invalid JSON in request body'}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())

    def log_message(self, format, *args):
        print(f"{datetime.now().isoformat()} - {format % args}")

if __name__ == "__main__":
    PORT = 3001
    
    with socketserver.TCPServer(("", PORT), ALTAIMateHandler) as httpd:
        print(f"🚀 ALT-AI-MATE backend server is listening at http://localhost:{PORT}")
        print("Available endpoints:")
        print("  GET  /api/health - Health check")
        print("  GET  /api/projects - List projects")
        print("  POST /api/projects - Create project")
        print("  GET  /api/servers - List servers")
        print("\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()