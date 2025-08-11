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

PORT = 8080
Handler = SimpleHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"🌾 Farm Management PWA Server running on http://0.0.0.0:{PORT}")
    httpd.allow_reuse_address = True
    httpd.serve_forever()