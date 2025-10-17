#!/usr/bin/env python3
"""
Simple HTTP Server for EQUADATOR Website Development
Serves the website on localhost to enable Firebase authentication
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with proper MIME types and CORS headers"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        
        super().end_headers()
    
    def guess_type(self, path):
        """Enhanced MIME type detection"""
        try:
            mime_type, encoding = super().guess_type(path)
        except (ValueError, TypeError):
            # Fallback for any mime type issues
            mime_type, encoding = 'text/html', None
        
        # Fix common MIME types
        if path.endswith('.js'):
            return 'application/javascript', encoding
        elif path.endswith('.css'):
            return 'text/css', encoding
        elif path.endswith('.html'):
            return 'text/html', encoding
        elif path.endswith('.json'):
            return 'application/json', encoding
        elif path.endswith('.svg'):
            return 'image/svg+xml', encoding
            
        return mime_type or 'text/html', encoding
    
    def do_GET(self):
        """Handle GET requests with fallback to index.html for SPA routing"""
        
        # Serve index.html for root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Check if file exists
        file_path = DIRECTORY / self.path.lstrip('/')
        
        if not file_path.exists() and not self.path.startswith('/api'):
            # For SPA routing, serve index.html for unknown routes
            # (except API routes which should return 404)
            self.path = '/index.html'
        
        return super().do_GET()
    
    def log_message(self, format, *args):
        """Custom logging with colors"""
        timestamp = self.log_date_time_string()
        client_ip = self.address_string()
        message = format % args
        
        # Color codes
        GREEN = '\033[92m'
        BLUE = '\033[94m'
        RESET = '\033[0m'
        
        print(f"{GREEN}[{timestamp}]{RESET} {BLUE}{client_ip}{RESET} - {message}")

def find_available_port(start_port=8000, max_attempts=10):
    """Find an available port starting from start_port"""
    import socket
    
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    
    raise RuntimeError(f"Could not find available port after {max_attempts} attempts")

def main():
    """Start the development server"""
    
    # Change to the website directory
    os.chdir(DIRECTORY)
    
    try:
        # Find available port
        port = find_available_port(PORT)
        
        # Create server
        with socketserver.TCPServer(("localhost", port), CustomHTTPRequestHandler) as httpd:
            print(f"""
🚀 EQUADATOR Development Server Starting...

📍 Server URL: http://localhost:{port}
📁 Serving directory: {DIRECTORY}
🔥 Firebase authentication will work properly on this URL

🌐 Available pages:
   • Homepage: http://localhost:{port}/
   • Login: http://localhost:{port}/login.html
   • Signup: http://localhost:{port}/signup.html
   • Dashboard: http://localhost:{port}/dashboard.html
   • Trading Terminal: http://localhost:{port}/enhanced-trading-terminal.html

Press Ctrl+C to stop the server
""")
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print(f"\n\n🛑 Server stopped. Thanks for using EQUADATOR dev server!")
                
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()