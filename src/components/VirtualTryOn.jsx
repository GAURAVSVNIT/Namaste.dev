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
        type: file.type
      };

      if (type === 'person') {
        setPersonImage(imageData);
      } else {
        setGarmentImage(imageData);
      }
    };
    reader.readAsDataURL(file);
  }, []);

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
                <Button 
                  onClick={() => {/* Generate function will go here */}}
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
