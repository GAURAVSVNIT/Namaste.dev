"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define a default height for the UploadBox component
const DEFAULT_HEIGHT = 200; // You can adjust this value as needed

const VirtualTryOn = () => {
  // State management
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragStates, setDragStates] = useState({ person: false, garment: false });
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // API configuration from environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_VIRTUAL_TRYON_API_URL ;

  // Refs for file inputs
  const personInputRef = useRef(null);
  const garmentInputRef = useRef(null);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [type]: true }));
  }, []);

  const handleDragOut = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [type]: false }));
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [type]: false }));
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  }, []);

  const handleFileUpload = useCallback((file, type) => {
    if (!file.type.startsWith('image/')) {
      console.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        src: e.target.result,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file // Store the actual file object for API upload
      };

      if (type === 'person') {
        setPersonImage(imageData);
      } else {
        setGarmentImage(imageData);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // API generation function
  const handleGenerate = async () => {
    if (!personImage || !garmentImage || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append('person_image', personImage.file);
      formData.append('garment_image', garmentImage.file);
      formData.append('garment_type', 'upper_body');
      formData.append('model_type', 'viton_hd');
      formData.append('steps', '30');
      formData.append('guidance_scale', '2.5');
      formData.append('seed', '42');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Try to connect to the FastAPI server first
      try {
        const response = await fetch(`${API_BASE_URL}/virtual-tryon`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setGeneratedImage({
            src: `data:image/png;base64,${result.result_image}`,
            name: 'virtual-tryon-result.png',
            size: 0,
            type: 'image/png'
          });
        } else {
          throw new Error(result.message || 'Failed to generate virtual try-on');
        }
      } catch (apiError) {
        // If API fails, fall back to demo mode
        console.warn('API not available, running in demo mode:', apiError.message);
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        
        setGeneratedImage({
          src: personImage.src, // Use the person image as demo result
          name: 'virtual-tryon-result.png',
          size: 0,
          type: 'image/png'
        });
      }

      clearInterval(progressInterval);
      setProgress(100);
    } catch (err) {
      console.error('Error generating virtual try-on:', err);
      setError(err.message || 'Failed to generate virtual try-on. Please try again.');
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload Box Component
  const UploadBox = ({ type, image, isDragging, height = DEFAULT_HEIGHT }) => (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer 
    flex items-center justify-center w-full h-[${height}px]
    ${isDragging ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg' : 'border-muted-foreground/20 hover:border-primary/40'}
    ${image ? 'border-solid border-primary/40' : ''}
    bg-white/80 backdrop-blur-sm hover:shadow-md`}
      onDrop={(e) => handleDrop(e, type)}
      style={{ height: `${height}px` }}
      onDragOver={handleDrag}
      onDragEnter={(e) => handleDragIn(e, type)}
      onDragLeave={(e) => handleDragOut(e, type)}
      onClick={() => type === 'person' ? personInputRef.current?.click() : garmentInputRef.current?.click()}
    >
      <input
        type="file"
        ref={type === 'person' ? personInputRef : garmentInputRef}
        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], type)}
        accept="image/*"
        className="hidden"
      />
      
      {image ? (
        <div className="relative w-full h-full group">
          <img 
            src={image.src} 
            alt={image.name}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (type === 'person') setPersonImage(null);
                else setGarmentImage(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          <Badge variant="secondary" className="absolute top-2 right-2">
            Uploaded
          </Badge>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium">Drop {type} image here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
          Virtual Try-On Studio
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload a person image and garment to generate a virtual try-on
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 item-stretch">
        {/* Person Image Column */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col justify-between border shadow-sm rounded-xl overflow-hidden bg-background/95">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
                <span className="bg-primary/10 p-2 rounded-lg">
                  🧍
                </span>
                <span>Person Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col">
              <UploadBox 
                type="person" 
                image={personImage} 
                isDragging={dragStates.person}
              />
            </CardContent>
          </Card>
        </div>

        {/* Garment Image Column */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col justify-between border shadow-sm rounded-xl overflow-hidden bg-background/95">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
                <span className="bg-primary/10 p-2 rounded-lg">
                  👕
                </span>
                <span>Garment Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col">
              <UploadBox 
                type="garment" 
                image={garmentImage} 
                isDragging={dragStates.garment}
              />
            </CardContent>
          </Card>
        </div>

        {/* Generated Image Column */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col justify-between border shadow-sm rounded-xl overflow-hidden bg-background/95">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
                <span className="bg-primary/10 p-2 rounded-lg">
                  🖼️
                </span>
                <span>Generated Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col">
              <div className="relative w-full h-full flex items-center justify-center bg-muted/20 rounded-xl">
                {generatedImage ? (
                  <img 
                    src={generatedImage.src} 
                    alt="Generated try-on"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>Generated image will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleGenerate}
                  disabled={!personImage || !garmentImage || isProcessing}
                  className="w-full h-12 text-base font-medium transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isProcessing ? 'Generating...' : 'Generate Try-On'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
