"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Sparkles, User, Shirt, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

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
      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[280px] group
        ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/20'}
        ${image ? 'border-solid border-blue-400 bg-blue-50/10' : 'bg-gray-50'}
        hover:shadow-md`}
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
            className="w-full h-full object-cover rounded-lg shadow-sm"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
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
              Change Image
            </Button>
          </div>
          <Badge variant="secondary" className="absolute top-3 right-3 bg-white/90 text-gray-800 border-gray-200 shadow-sm">
            ✓ Uploaded
          </Badge>
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-md p-2 text-xs text-gray-600 truncate">
            {image.name}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 p-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
            <Upload className="h-6 w-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-800">
              {type === 'person' ? 'Upload a full-body photo' : 'Upload a garment photo'}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop or <span className="text-blue-600 font-medium">browse files</span>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              {type === 'person' 
                ? 'For best results, use a well-lit full-body photo with a plain background' 
                : 'Use a photo of the garment on a plain background for best results'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Virtual Try-On Studio
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of online shopping with our AI-powered virtual fitting room
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Images
            </TabsTrigger>
            <TabsTrigger value="webcam" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Use Webcam
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Person Image Upload */}
              <Card className="border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-800">Person Image</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Upload a full-body photo of yourself
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <UploadBox 
                    type="person" 
                    image={personImage} 
                    isDragging={dragStates.person}
                  />
                </CardContent>
              </Card>

              {/* Garment Image Upload */}
              <Card className="border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                      <Shirt className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-800">Garment Image</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Upload a photo of the clothing item
                      </CardDescription>
                    </div>
                  </div>
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
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      >
                        <option value="upper_body">👕 Upper Body (Shirts, Tops)</option>
                        <option value="lower_body">👖 Lower Body (Pants, Skirts)</option>
                        <option value="dresses">👗 Dresses & Jumpsuits</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                      <select 
                        value={modelType} 
                        onChange={(e) => setModelType(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      >
                        <option value="viton_hd">✨ VITON-HD (Recommended)</option>
                        <option value="dress_code">👗 DressCode (For Dresses)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {modelType === 'viton_hd' 
                          ? 'Best for most clothing types' 
                          : 'Optimized for dresses and full-body outfits'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Result */}
            <Card className="border-2 border-gray-200 overflow-hidden transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-800">Virtual Try-On Result</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        See how the garment looks on you
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {isProcessing ? 'Processing...' : generatedImage ? 'Ready' : 'Waiting'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative w-full bg-gray-50 rounded-xl min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-200 overflow-hidden transition-all">
                  {isProcessing ? (
                    <div className="text-center p-8 w-full">
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="relative">
                          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: '75%' }}
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Processing your try-on...</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">AI is working its magic</p>
                          <p className="text-xs text-gray-500">This usually takes 15-30 seconds</p>
                        </div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center p-8 max-w-sm mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <X className="h-8 w-8" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h4>
                      <p className="text-sm text-gray-600 mb-6">{error}</p>
                      <Button 
                        onClick={() => setError(null)}
                        variant="outline" 
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : generatedImage ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={generatedImage.src} 
                        alt="Generated try-on"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button variant="secondary" className="bg-white/90 hover:bg-white">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 max-w-sm mx-auto">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Your result will appear here</h4>
                      <p className="text-sm text-gray-500">
                        Upload both images and click "Generate Try-On" to see the magic
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Generate Button */}
                <div className="mt-8">
                  <Button 
                    onClick={handleGenerate}
                    disabled={!personImage || !garmentImage || isProcessing}
                    className="w-full h-14 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5" />
                        <span>Generate Try-On</span>
                      </div>
                    )}
                  </Button>
                  
                  {(!personImage || !garmentImage) && (
                    <p className="mt-3 text-sm text-center text-gray-500">
                      {!personImage && !garmentImage 
                        ? 'Upload both images to continue' 
                        : !personImage 
                          ? 'Upload a person image to continue' 
                          : 'Upload a garment image to continue'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="webcam" className="text-center py-12">
            <div className="max-w-lg mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Webcam Try-On</h3>
              <p className="text-gray-600 mb-6">Coming soon! Use your webcam for instant virtual try-ons.</p>
              <Button disabled variant="outline" className="gap-2">
                <span>🔜</span>
                Notify Me When Available
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VirtualTryOn;
