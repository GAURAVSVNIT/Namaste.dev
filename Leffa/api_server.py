#!/usr/bin/env python3
"""
FastAPI server for Leffa model - to be used with Next.js
"""
import os
import gc
import torch
import base64
import io
import logging
import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import uvicorn

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Memory optimization
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:512,expandable_segments:True'
if torch.cuda.is_available():
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True

# Add current directory and 3rdparty to Python path
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, '3rdparty'))

# Import Leffa components
from leffa.transform import LeffaTransform
from leffa.model import LeffaModel
from leffa.inference import LeffaInference
from leffa_utils.garment_agnostic_mask_predictor import AutoMasker
from leffa_utils.densepose_predictor import DensePosePredictor
from leffa_utils.utils import resize_and_center, get_agnostic_mask_hd, get_agnostic_mask_dc
from preprocess.humanparsing.run_parsing import Parsing
from preprocess.openpose.run_openpose import OpenPose

app = FastAPI(
    title="Leffa API", 
    description="Virtual Try-on and Pose Transfer API",
    # Add these for better tunnel compatibility
    timeout=600,  # 10 minutes timeout
    limit_concurrency=10
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://namaste-dev.vercel.app",
        "http://localhost:3000",  # for local development
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LeffaAPIPredictor:
    def __init__(self):
        logger.info("Initializing Leffa API Predictor...")
        
        # Initialize lightweight components
        self.parsing = Parsing(
            atr_path="./ckpts/humanparsing/parsing_atr.onnx",
            lip_path="./ckpts/humanparsing/parsing_lip.onnx",
        )
        
        self.openpose = OpenPose(
            body_model_path="./ckpts/openpose/body_pose_model.pth",
        )
        
        # Lazy loading for heavy models
        self._mask_predictor = None
        self._densepose_predictor = None
        self._vt_inference_hd = None
        self._vt_inference_dc = None
        self._pt_inference = None
        
        logger.info("Leffa API Predictor initialized")
    
    @property
    def mask_predictor(self):
        if self._mask_predictor is None:
            logger.info("Loading mask predictor...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self._mask_predictor = AutoMasker(
                densepose_path="./ckpts/densepose",
                schp_path="./ckpts/schp",
                device=device,
            )
        return self._mask_predictor
    
    @property
    def densepose_predictor(self):
        if self._densepose_predictor is None:
            logger.info("Loading DensePose predictor...")
            self._densepose_predictor = DensePosePredictor(
                config_path="./ckpts/densepose/densepose_rcnn_R_50_FPN_s1x.yaml",
                weights_path="./ckpts/densepose/model_final_162be9.pkl",
            )
        return self._densepose_predictor
    
    @property
    def vt_inference_hd(self):
        if self._vt_inference_hd is None:
            logger.info("Loading Virtual Try-on HD model...")
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            vt_model_hd = LeffaModel(
                pretrained_model_name_or_path="./ckpts/stable-diffusion-inpainting",
                pretrained_model="./ckpts/virtual_tryon.pth",
                dtype="float16",
            )
            self._vt_inference_hd = LeffaInference(model=vt_model_hd)
        return self._vt_inference_hd
    
    @property
    def vt_inference_dc(self):
        if self._vt_inference_dc is None:
            logger.info("Loading Virtual Try-on DC model...")
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            vt_model_dc = LeffaModel(
                pretrained_model_name_or_path="./ckpts/stable-diffusion-inpainting",
                pretrained_model="./ckpts/virtual_tryon_dc.pth",
                dtype="float16",
            )
            self._vt_inference_dc = LeffaInference(model=vt_model_dc)
        return self._vt_inference_dc
    
    @property
    def pt_inference(self):
        if self._pt_inference is None:
            logger.info("Loading Pose Transfer model...")
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            pt_model = LeffaModel(
                pretrained_model_name_or_path="./ckpts/stable-diffusion-xl-1.0-inpainting-0.1",
                pretrained_model="./ckpts/pose_transfer.pth",
                dtype="float16",
            )
            self._pt_inference = LeffaInference(model=pt_model)
        return self._pt_inference
    
    def predict_virtual_tryon(
        self,
        person_image: Image.Image,
        garment_image: Image.Image,
        garment_type: str = "upper_body",
        model_type: str = "viton_hd",
        steps: int = 30,
        guidance_scale: float = 2.5,
        seed: int = 42
    ):
        """Predict virtual try-on"""
        logger.info(f"Starting virtual try-on prediction...")
        
        # Clear GPU cache
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
        
        try:
            # Resize images
            person_image = resize_and_center(person_image, 768, 1024)
            garment_image = resize_and_center(garment_image, 768, 1024)
            
            person_array = np.array(person_image)
            
            # Process person image
            person_image_rgb = person_image.convert("RGB")
            model_parse, _ = self.parsing(person_image_rgb.resize((384, 512)))
            keypoints = self.openpose(person_image_rgb.resize((384, 512)))
            
            # Generate mask - map garment types to expected format
            garment_category_map = {
                "upper_body": "upper_body",
                "lower_body": "lower_body", 
                "dress": "dresses",
                "dresses": "dresses"
            }
            mapped_garment_type = garment_category_map.get(garment_type, "upper_body")
            
            if model_type == "viton_hd":
                mask = get_agnostic_mask_hd(model_parse, keypoints, mapped_garment_type)
            else:
                mask = get_agnostic_mask_dc(model_parse, keypoints, mapped_garment_type)
            mask = mask.resize((768, 1024))
            
            # Generate DensePose
            if model_type == "viton_hd":
                densepose_array = self.densepose_predictor.predict_seg(person_array)[:, :, ::-1]
                densepose = Image.fromarray(densepose_array)
            else:
                densepose_array = self.densepose_predictor.predict_iuv(person_array)
                densepose_seg_array = densepose_array[:, :, 0:1]
                densepose_seg_array = np.concatenate([densepose_seg_array] * 3, axis=-1)
                densepose = Image.fromarray(densepose_seg_array)
            
            # Transform data
            transform = LeffaTransform()
            data = {
                "src_image": [person_image],
                "ref_image": [garment_image],
                "mask": [mask],
                "densepose": [densepose],
            }
            data = transform(data)
            
            # Select inference model
            if model_type == "viton_hd":
                inference = self.vt_inference_hd
            else:
                inference = self.vt_inference_dc
            
            # Run inference
            output = inference(
                data,
                ref_acceleration=True,  # Enable acceleration for API
                num_inference_steps=steps,
                guidance_scale=guidance_scale,
                seed=seed,
                repaint=False,
            )
            
            result_image = output["generated_image"][0]
            
            return {
                "result_image": result_image,
                "mask": mask,
                "densepose": densepose
            }
            
        finally:
            # Clean up memory
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()
    
    def predict_pose_transfer(
        self,
        person_image: Image.Image,
        target_pose_image: Image.Image,
        steps: int = 30,
        guidance_scale: float = 2.5,
        seed: int = 42
    ):
        """Predict pose transfer"""
        logger.info(f"Starting pose transfer prediction...")
        
        # Clear GPU cache
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
        
        try:
            # Resize images
            person_image = resize_and_center(person_image, 768, 1024)
            target_pose_image = resize_and_center(target_pose_image, 768, 1024)
            
            person_array = np.array(person_image)
            target_array = np.array(target_pose_image)
            
            # Generate mask (full body for pose transfer)
            mask = Image.fromarray(np.ones_like(person_array) * 255)
            
            # Generate DensePose for pose transfer
            densepose_array = self.densepose_predictor.predict_iuv(target_array)[:, :, ::-1]
            densepose = Image.fromarray(densepose_array)
            
            # Transform data
            transform = LeffaTransform()
            data = {
                "src_image": [target_pose_image],  # Target pose as source
                "ref_image": [person_image],       # Person as reference
                "mask": [mask],
                "densepose": [densepose],
            }
            data = transform(data)
            
            # Run inference
            output = self.pt_inference(
                data,
                ref_acceleration=True,
                num_inference_steps=steps,
                guidance_scale=guidance_scale,
                seed=seed,
                repaint=False,
            )
            
            result_image = output["generated_image"][0]
            
            return {
                "result_image": result_image,
                "mask": mask,
                "densepose": densepose
            }
            
        finally:
            # Clean up memory
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()

# Global predictor instance
predictor = None

# Exception handler for connection errors - commenting out problematic handlers
# @app.exception_handler(ConnectionResetError)
# async def connection_reset_handler(request: Request, exc: ConnectionResetError):
#     logger.warning(f"Connection reset by client: {exc}")
#     return JSONResponse(
#         status_code=499,
#         content={"detail": "Client disconnected"}
#     )

# @app.exception_handler(asyncio.CancelledError) 
# async def cancelled_error_handler(request: Request, exc: asyncio.CancelledError):
#     logger.warning(f"Request cancelled: {exc}")
#     return JSONResponse(
#         status_code=499,
#         content={"detail": "Request cancelled"}
#     )

@app.on_event("startup")
async def startup_event():
    global predictor
    logger.info("Starting Leffa API server...")
    predictor = LeffaAPIPredictor()

@app.get("/")
async def root():
    return {"message": "Leffa API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    gpu_info = {}
    if torch.cuda.is_available():
        gpu_info = {
            "device": torch.cuda.get_device_name(),
            "memory_total": f"{torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB",
            "memory_allocated": f"{torch.cuda.memory_allocated() / 1024**3:.1f} GB",
            "memory_cached": f"{torch.cuda.memory_reserved() / 1024**3:.1f} GB"
        }
    return {"status": "healthy", "gpu": gpu_info}

def image_to_base64(image: Image.Image, quality: int = 85) -> str:
    """Convert PIL Image to base64 string with compression for better tunnel transmission"""
    buffer = io.BytesIO()
    # Use JPEG with quality compression for smaller payload
    if image.mode == "RGBA":
        # Convert RGBA to RGB for JPEG
        rgb_image = Image.new('RGB', image.size, (255, 255, 255))
        rgb_image.paste(image, mask=image.split()[3])
        rgb_image.save(buffer, format="JPEG", quality=quality, optimize=True)
    else:
        image.save(buffer, format="JPEG", quality=quality, optimize=True)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

@app.post("/virtual-tryon")
async def virtual_tryon_endpoint(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    garment_type: str = Form("upper_body"),
    model_type: str = Form("viton_hd"),
    steps: int = Form(30),
    guidance_scale: float = Form(2.5),
    seed: int = Form(42)
):
    """Virtual try-on endpoint"""
    try:
        logger.info(f"Received virtual try-on request: garment_type={garment_type}, model_type={model_type}")
        
        # Load images
        person_img = Image.open(io.BytesIO(await person_image.read()))
        garment_img = Image.open(io.BytesIO(await garment_image.read()))
        
        # Run prediction
        result = predictor.predict_virtual_tryon(
            person_image=person_img,
            garment_image=garment_img,
            garment_type=garment_type,
            model_type=model_type,
            steps=steps,
            guidance_scale=guidance_scale,
            seed=seed
        )
        
        # Convert images to base64 with compression
        response = {
            "success": True,
            "result_image": image_to_base64(result["result_image"], quality=90),
            "mask": image_to_base64(result["mask"], quality=75),
            "densepose": image_to_base64(result["densepose"], quality=75)
        }
        
        # Add headers for better tunnel compatibility
        headers = {
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache"
        }
        
        return JSONResponse(content=response, headers=headers)
        
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_traceback = traceback.format_exc()
        logger.error(f"Error in virtual try-on: {error_msg}")
        logger.error(f"Full traceback: {error_traceback}")
        raise HTTPException(status_code=500, detail=error_msg if error_msg else "Unknown error occurred")

@app.post("/pose-transfer")
async def pose_transfer_endpoint(
    person_image: UploadFile = File(...),
    target_pose_image: UploadFile = File(...),
    steps: int = Form(30),
    guidance_scale: float = Form(2.5),
    seed: int = Form(42)
):
    """Pose transfer endpoint"""
    try:
        logger.info(f"Received pose transfer request")
        
        # Load images
        person_img = Image.open(io.BytesIO(await person_image.read()))
        target_pose_img = Image.open(io.BytesIO(await target_pose_image.read()))
        
        # Run prediction
        result = predictor.predict_pose_transfer(
            person_image=person_img,
            target_pose_image=target_pose_img,
            steps=steps,
            guidance_scale=guidance_scale,
            seed=seed
        )
        
        # Convert images to base64 with compression
        response = {
            "success": True,
            "result_image": image_to_base64(result["result_image"], quality=90),
            "mask": image_to_base64(result["mask"], quality=75),
            "densepose": image_to_base64(result["densepose"], quality=75)
        }
        
        # Add headers for better tunnel compatibility
        headers = {
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache"
        }
        
        return JSONResponse(content=response, headers=headers)
        
    except Exception as e:
        logger.error(f"Error in pose transfer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",  # Allow external connections for tunnels
        port=8000,
        reload=False,
        log_level="info",
        # Additional settings for better tunnel compatibility
        timeout_keep_alive=60,  # Keep connections alive longer
        timeout_graceful_shutdown=30,
        limit_max_requests=1000,
        limit_concurrency=100,
        backlog=2048,
        # HTTP/1.1 settings for better compatibility
        http="h11",  # Use h11 instead of httptools for better compatibility
        loop="asyncio"  # Explicit asyncio loop
    )
