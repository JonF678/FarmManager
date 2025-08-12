#!/usr/bin/env python3
"""Simple HTTP server for the Farm Management PWA"""
import http.server
import socketserver
import os

class SimpleHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

PORT = 5000
Handler = SimpleHandler

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

# Try to find an available port starting from 5000
def find_free_port(start_port=5000, max_port=5010):
    for port in range(start_port, max_port + 1):
        try:
            with ReusableTCPServer(("0.0.0.0", port), Handler) as test_server:
                return port
        except OSError:
            continue
    raise OSError("No free ports available")

try:
    PORT = find_free_port()
    with ReusableTCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"🌾 Farm Management PWA Server running on http://0.0.0.0:{PORT}")
        httpd.serve_forever()
except OSError as e:
    print(f"Error: {e}")
    exit(1)