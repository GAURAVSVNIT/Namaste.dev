"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragStates, setDragStates] = useState({ person: false, garment: false });
  const [error, setError] = useState(null);
  const [garmentType, setGarmentType] = useState('upper_body');
  const [modelType, setModelType] = useState('viton_hd');

  const personInputRef = useRef(null);
  const garmentInputRef = useRef(null);

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

  const handleGenerate = async () => {
    if (!personImage || !garmentImage) return;

    setIsProcessing(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Create FormData for the API request
      const formData = new FormData();
      formData.append('person_image', personImage.file);
      formData.append('garment_image', garmentImage.file);
      formData.append('garment_type', garmentType);
      formData.append('model_type', modelType);
      formData.append('steps', '30');
      formData.append('guidance_scale', '2.5');
      formData.append('seed', '42');

      // Make API request to Leffa server
      const response = await fetch('http://localhost:8000/virtual-tryon', {
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
          name: 'generated-tryon.png',
          size: 0,
          type: 'image/png'
        });
      } else {
        throw new Error('API returned unsuccessful result');
      }
    } catch (err) {
      console.error('Error generating virtual try-on:', err);
      setError(err.message || 'Failed to generate virtual try-on. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const UploadBox = ({ type, image, isDragging }) => (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[350px] group
        ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-xl' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}
        ${image ? 'border-solid border-blue-400 bg-blue-50/20' : 'bg-gray-50/50'}
        backdrop-blur-sm hover:shadow-lg`}
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={handleDrag}
      onDragEnter={(e) => handleDragIn(e, type)}
      onDragLeave={(e) => handleDragOut(e, type)}
      onClick={() => type === 'person' ? personInputRef.current?.click() : garmentInputRef.current?.click()}
    >
      <input
        type="file"
        ref={type === 'person' ? personInputRef : garmentInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], type)}
        accept="image/*"
        className="hidden"
      />
      
      {image ? (
        <div className="relative w-full h-full group/image">
          <img 
            src={image.src} 
            alt={image.name}
            className="w-full h-full object-cover rounded-xl shadow-md"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (type === 'person') setPersonImage(null);
                else setGarmentImage(null);
              }}
              className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          <Badge variant="secondary" className="absolute top-3 right-3 bg-green-100 text-green-800 border-green-200">
            ✓ Uploaded
          </Badge>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <Upload className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
          </div>
          <div className="space-y-3">
            <p className="text-lg font-semibold text-gray-800">Drop {type} image here</p>
            <p className="text-sm text-gray-600">or click to browse files</p>
            <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF (Max 10MB)</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Virtual Try-On Studio
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Upload a person image and garment to generate a virtual try-on using AI technology
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Person Image Upload */}
          <div className="w-full">
            <Card className="h-full border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 p-6">
                <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-3">
                  <span className="bg-blue-100 p-3 rounded-full text-3xl">🧍</span>
                  <span className="text-gray-800">Person Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <UploadBox 
                  type="person" 
                  image={personImage} 
                  isDragging={dragStates.person}
                />
              </CardContent>
            </Card>
          </div>

          {/* Garment Image Upload */}
          <div className="w-full">
            <Card className="h-full border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100 p-6">
                <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-3">
                  <span className="bg-purple-100 p-3 rounded-full text-3xl">👕</span>
                  <span className="text-gray-800">Garment Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <UploadBox 
                  type="garment" 
                  image={garmentImage} 
                  isDragging={dragStates.garment}
                />
                
                {/* Configuration Options */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Garment Type</label>
                    <select 
                      value={garmentType} 
                      onChange={(e) => setGarmentType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="upper_body">Upper Body</option>
                      <option value="lower_body">Lower Body</option>
                      <option value="dresses">Dresses</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                    <select 
                      value={modelType} 
                      onChange={(e) => setModelType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="viton_hd">VITON-HD (Recommended)</option>
                      <option value="dress_code">DressCode (Experimental)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Image Result */}
          <div className="w-full">
            <Card className="h-full border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b-2 border-green-100 p-6">
                <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-3">
                  <span className="bg-green-100 p-3 rounded-full text-3xl">🖼️</span>
                  <span className="text-gray-800">Generated Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative w-full bg-gray-50 rounded-2xl min-h-[350px] flex items-center justify-center border-2 border-dashed border-gray-300">
                  {isProcessing ? (
                    <div className="text-center space-y-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-700">Generating try-on...</p>
                        <p className="text-sm text-gray-500">This may take a few moments</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center p-8 text-red-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <p className="text-lg font-medium">Error occurred</p>
                      <p className="text-sm mt-2 text-red-600">{error}</p>
                      <Button 
                        onClick={() => setError(null)}
                        variant="outline" 
                        size="sm" 
                        className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Dismiss
                      </Button>
                    </div>
                  ) : generatedImage ? (
                    <img 
                      src={generatedImage.src} 
                      alt="Generated try-on"
                      className="w-full h-full object-cover rounded-xl shadow-md"
                    />
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <p className="text-lg font-medium">Generated image will appear here</p>
                      <p className="text-sm mt-2">Upload both images to get started</p>
                    </div>
                  )}
                </div>
                
                {/* Generate Button */}
                <div className="mt-8">
                  <Button 
                    onClick={handleGenerate}
                    disabled={!personImage || !garmentImage || isProcessing}
                    className="w-full h-14 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>✨</span>
                        <span>Generate Try-On</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
