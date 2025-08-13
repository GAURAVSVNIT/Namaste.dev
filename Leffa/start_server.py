#!/usr/bin/env python3
"""
Startup script for Leffa FastAPI server
"""
import os
import sys

# Set environment variables for optimal performance
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:512,expandable_segments:True'

# Add paths
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, '3rdparty'))

# Import and run the server
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Leffa API Server...")
    print("📍 Local server: http://127.0.0.1:8000")
    print("📍 Network server: http://0.0.0.0:8000")
    print("📍 API Documentation at: http://127.0.0.1:8000/docs")
    print("📍 Health check at: http://127.0.0.1:8000/health")
    print("🔧 Compatible with Cloudflare tunnels")
    print("🔧 Make sure your Next.js app is running on http://localhost:3000")
    print("\n" + "="*50)
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",  # Allow external connections for tunnels
        port=8000,
        reload=False,
        log_level="info",
        # Additional settings for better tunnel compatibility
        timeout_keep_alive=60,
        timeout_graceful_shutdown=30,
        limit_max_requests=1000,
        limit_concurrency=100,
        backlog=2048,
        # HTTP/1.1 settings for better compatibility
        http="h11",
        loop="asyncio"
    )
