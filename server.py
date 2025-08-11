#!/usr/bin/env python3
"""
Simple HTTP server for the Farm Management PWA
"""
import http.server
import socketserver
import os
import mimetypes
import socket
import subprocess
from urllib.parse import urlparse

class FarmAppHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle root path
        if path == '/' or path == '':
            path = '/index.html'
        
        # Remove leading slash for file system
        if path.startswith('/'):
            path = path[1:]
        
        # Security check - prevent directory traversal
        if '..' in path:
            self.send_error(404)
            return
        
        # Check if file exists
        if os.path.exists(path) and os.path.isfile(path):
            # Get MIME type
            content_type, _ = mimetypes.guess_type(path)
            if content_type is None:
                if path.endswith('.js'):
                    content_type = 'application/javascript'
                elif path.endswith('.css'):
                    content_type = 'text/css'
                elif path.endswith('.json'):
                    content_type = 'application/json'
                else:
                    content_type = 'text/plain'
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', content_type)
            
            # Force no caching for all files during development
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Last-Modified', 'Thu, 01 Jan 1970 00:00:00 GMT')
            
            # CORS headers for local development
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            
            self.end_headers()
            
            # Send file content
            with open(path, 'rb') as file:
                self.wfile.write(file.read())
        else:
            # File not found, serve index.html for SPA routing
            if os.path.exists('index.html'):
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                
                with open('index.html', 'rb') as file:
                    self.wfile.write(file.read())
            else:
                self.send_error(404)

def run_server(port=5000):
    """Run the HTTP server"""
    handler = FarmAppHandler
    httpd = None
    
    try:
        # Kill any existing processes on this port first
        import subprocess
        try:
            subprocess.run(['pkill', '-f', 'python.*server'], check=False, capture_output=True)
        except:
            pass
        
        httpd = socketserver.TCPServer(("0.0.0.0", port), handler)
        httpd.allow_reuse_address = True
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        print(f"🌾 Farm Management PWA Server running on http://0.0.0.0:{port}")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"Port {port} is busy. Attempting to clear...")
            try:
                subprocess.run(['pkill', '-9', '-f', 'python.*server'], check=False)
                print("Cleared existing processes. Please restart.")
            except:
                print("Could not clear port. Manual intervention required.")
        else:
            print(f"Error starting server: {e}")
    finally:
        if httpd:
            httpd.server_close()

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    run_server(port)