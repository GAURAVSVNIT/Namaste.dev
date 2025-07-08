# Leffa AI Virtual Try-On Integration

This document explains how to use the Leffa AI model with your Next.js application.

## Overview

Your Next.js app now connects to a FastAPI server that runs the Leffa AI model for virtual try-on functionality. The integration provides:

- ✨ Real AI-powered virtual try-on
- 🚀 Optimized for your RTX 4050 GPU (6GB VRAM)
- 🎛️ Configurable garment types and model settings
- 📊 Real-time debug logs and progress tracking
- 💾 Download generated images

## Setup Instructions

### 1. Start the FastAPI Server

Open a terminal and navigate to the Leffa directory:

```bash
cd D:\Leffa
uv run start_server.py
```

The server will start on `http://127.0.0.1:8000`. You should see:
- ✅ GPU detection (RTX 4050 Laptop GPU)
- 📍 Server endpoints
- 🔧 Model loading (lazy-loaded when first used)

### 2. Start Your Next.js App

In another terminal, navigate to your Next.js project:

```bash
cd D:\Namaste.dev
npm run dev
```

Your app will be available at `http://localhost:3000`

### 3. Test the Integration

1. Go to `http://localhost:3000/virtual-tryon`
2. Upload a person image and garment image
3. Click "Generate" to process with AI
4. Download the result!

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server status |
| `/health` | GET | GPU and server health |
| `/virtual-tryon` | POST | Generate virtual try-on |
| `/pose-transfer` | POST | Generate pose transfer |
| `/docs` | GET | API documentation |

## Configuration Options

### Model Types
- **VITON-HD** (Recommended): Best quality for upper body garments
- **DressCode** (Experimental): For various garment types

### Garment Types
- **Upper Body**: T-shirts, blouses, jackets
- **Lower Body**: Pants, skirts
- **Dress**: Full dresses

### Advanced Settings
- **Inference Steps**: 20-100 (default: 30) - Higher = better quality, slower
- **Guidance Scale**: 1-20 (default: 2.5) - Controls how closely AI follows the input

## Performance Tips

- **Memory Usage**: The server uses lazy loading to optimize GPU memory
- **Processing Time**: ~30-60 seconds per image on RTX 4050
- **Image Size**: Automatically resized to 768x1024 for optimal processing
- **Batch Processing**: Process one image at a time for best performance

## Troubleshooting

### Server Won't Start
```bash
# Check if dependencies are installed
cd D:\Leffa
uv pip install fastapi uvicorn python-multipart

# Check GPU availability
python -c "import torch; print(torch.cuda.is_available())"
```

### API Connection Failed
1. Ensure FastAPI server is running on port 8000
2. Check if Windows Firewall is blocking the connection
3. Test with: `cd D:\Namaste.dev && node test-api.js`

### Out of Memory Errors
- Reduce inference steps to 20-25
- Close other GPU-intensive applications
- Restart the FastAPI server to clear GPU cache

### Slow Processing
- Enable "Accelerate Reference UNet" in advanced options
- Reduce inference steps
- Ensure no other processes are using the GPU

## Files Modified

- `src/components/VirtualTryOn.jsx` - Updated to connect to FastAPI
- `LEFFA_INTEGRATION.md` - This documentation
- `test-api.js` - API connection test script

## Next Steps

1. **Custom Training**: Train on your own garment datasets
2. **Batch Processing**: Add support for multiple images
3. **Cloud Deployment**: Deploy FastAPI server to cloud with GPU
4. **Mobile Support**: Optimize for mobile devices
5. **Real-time Preview**: Add live preview functionality

## Support

If you encounter issues:
1. Check the debug logs in the Virtual Try-On interface
2. Verify GPU memory usage in Task Manager
3. Restart both servers if needed
4. Check that all dependencies are installed correctly

Enjoy your AI-powered virtual try-on! 🎉
