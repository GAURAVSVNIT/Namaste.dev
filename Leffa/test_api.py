#!/usr/bin/env python3
"""
Test script to verify the API endpoints work through the tunnel
"""
import requests
import json

# Test the basic endpoints
base_url = "https://collected-spot-hearts-came.trycloudflare.com"

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{base_url}/")
        print(f"Root endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing root endpoint: {e}")
        return False

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing health endpoint: {e}")
        return False

def test_cors():
    """Test CORS headers"""
    try:
        headers = {
            'Origin': 'https://namaste-dev.vercel.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{base_url}/virtual-tryon", headers=headers)
        print(f"CORS preflight: {response.status_code}")
        print(f"CORS headers: {dict(response.headers)}")
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"Error testing CORS: {e}")
        return False

if __name__ == "__main__":
    print("Testing API endpoints through Cloudflare tunnel...")
    print("=" * 50)
    
    # Test endpoints
    root_ok = test_root_endpoint()
    print()
    
    health_ok = test_health_endpoint() 
    print()
    
    cors_ok = test_cors()
    print()
    
    if all([root_ok, health_ok, cors_ok]):
        print("✅ All tests passed! API is accessible through the tunnel.")
    else:
        print("❌ Some tests failed.")
        
    print("\nYour API endpoints:")
    print(f"Root: {base_url}/")
    print(f"Health: {base_url}/health") 
    print(f"Virtual Try-on: {base_url}/virtual-tryon")
    print(f"Pose Transfer: {base_url}/pose-transfer")
