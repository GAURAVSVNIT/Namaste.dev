#!/usr/bin/env python3
"""
Optimized runner for Leffa with memory management
"""
import os
import gc
import torch

# Set optimal environment variables for memory management
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:512,expandable_segments:True'
os.environ['CUDA_LAUNCH_BLOCKING'] = '0'  # Enable async execution
os.environ['TORCH_CUDA_ARCH_LIST'] = '8.6'  # Optimize for RTX 30xx/40xx series

def setup_memory_optimization():
    """Setup memory optimization settings"""
    if torch.cuda.is_available():
        # Enable memory mapping for better memory usage
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
        
        # Clear initial cache
        torch.cuda.empty_cache()
        gc.collect()
        
        print(f"CUDA Device: {torch.cuda.get_device_name()}")
        print(f"CUDA Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
        print(f"CUDA Memory Allocated: {torch.cuda.memory_allocated() / 1024**3:.1f} GB")
        print(f"CUDA Memory Cached: {torch.cuda.memory_reserved() / 1024**3:.1f} GB")
    else:
        print("CUDA not available, running on CPU")

if __name__ == "__main__":
    setup_memory_optimization()
    
    # Import and run the app
    import sys
    sys.path.append('.')
    
    # Set Python path
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    sys.path.insert(0, os.path.join(current_dir, '3rdparty'))
    
    # Now run the app
    with open('app.py', 'r', encoding='utf-8') as f:
        exec(f.read())
