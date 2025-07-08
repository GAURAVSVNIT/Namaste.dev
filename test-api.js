// Simple test script to verify API connection
// Run this with: node test-api.js

const fetch = require('node-fetch');

async function testConnection() {
  try {
    console.log('🔍 Testing connection to Leffa API...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://127.0.0.1:8000/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API is healthy!');
      console.log('📊 GPU Info:', JSON.stringify(healthData.gpu, null, 2));
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
    
    // Test root endpoint
    const rootResponse = await fetch('http://127.0.0.1:8000/');
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('✅ Root endpoint working:', rootData.message);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure the FastAPI server is running on http://127.0.0.1:8000');
    console.log('💡 Start the server with: cd D:\\Leffa && uv run start_server.py');
  }
}

testConnection();
