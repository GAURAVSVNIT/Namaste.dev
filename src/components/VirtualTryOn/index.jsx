"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, User, Shirt, ImageIcon, Loader2, Camera, Bell, Upload, CheckCircle, RefreshCw, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import styles from './VirtualTryOn.module.css';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dragStates, setDragStates] = useState({ person: false, garment: false });
  const [savedTryOns, setSavedTryOns] = useState([]);
  
  const personInputRef = useRef(null);
  const garmentInputRef = useRef(null);
  const resultRef = useRef(null);
  
  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

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
        file: file
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
    if (!personImage || !garmentImage || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setShowSuccess(false);
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
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);

          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          throw new Error(result.message || 'Failed to generate virtual try-on');
        }
      } catch (apiError) {
        console.warn('API not available, running in demo mode:', apiError.message);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setGeneratedImage({
          src: personImage.src,
          name: 'virtual-tryon-result.png',
          size: 0,
          type: 'image/png'
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

    } catch (err) {
      console.error('Error generating virtual try-on:', err);
      setError(err.message || 'Failed to generate virtual try-on. Please try again.');

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage.src;
      link.download = 'virtual-tryon-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = (imageUrl) => {
    if (navigator.share) {
      navigator.share({
        title: 'Virtual Try-On Result',
        text: 'Check out my virtual try-on result!',
        url: imageUrl || (generatedImage ? generatedImage.src : '')
      });
    } else {
      const url = imageUrl || (generatedImage ? generatedImage.src : '');
      if (url) {
        navigator.clipboard.writeText(url);
        alert('Image URL copied to clipboard!');
      }
    }
  };

  const handleDownloadGallery = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'virtual-tryon-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const UploadBox = memo(({ type, image, setImage, handleFileUpload, isDragging }) => {
    const inputRef = useRef(null);

    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        className={clsx(
          styles.uploadBox,
          isDragging ? "border-blue-500 bg-blue-50/30 scale-[1.01] shadow-lg" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/10",
          image ? "border-solid border-blue-400 bg-gradient-to-br from-blue-50/20 to-purple-50/10" : "bg-gray-50",
          "hover:shadow-md backdrop-blur-sm"
        )}
        onDrop={(e) => handleDrop(e, type)}
        onDragOver={handleDrag}
        onDragEnter={(e) => handleDragIn(e, type)}
        onDragLeave={(e) => handleDragOut(e, type)}
        onClick={() => inputRef.current?.click()}
        aria-label={type === 'person' ? 'Upload person image' : 'Upload garment image'}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className={styles.cardContentArea}>
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0], type);
              }
            }}
            accept="image/*"
            className="hidden"
            aria-label={`Select ${type} image`}
          />
      
          {image ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full min-h-[500px] bg-white rounded-xl"
            >
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img 
                  src={image.src} 
                  alt={type === 'person' ? 'Person preview' : 'Garment preview'}
                  className="h-full w-auto max-w-full object-contain"
                  style={{ maxHeight: '100%' }}
                />
              </div>
              
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                  }}
                  className="bg-white/90 hover:bg-white text-gray-800 shadow-lg z-10"
                  aria-label="Change image"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </div>
              
              <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800 border border-gray-200 shadow-sm z-10">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Uploaded
              </Badge>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center space-y-4 p-4 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300">
                {type === 'person' ? (
                  <User className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                ) : (
                  <Shirt className="h-8 w-8 text-purple-500 group-hover:text-purple-600 transition-colors" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">
                  {type === 'person' ? 'Add your photo' : 'Add garment photo'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag & drop or <span className="text-blue-600 font-medium">click to browse</span>
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {type === 'person' ? 'PNG, JPG, WEBP' : 'Max 5MB'}
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-gray-400">
                  {type === 'person' 
                    ? 'For best results, use a well-lit full-body photo' 
                    : 'Use a clear photo of the garment on a plain background'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  });

  if (!isMounted) return null;

  return (
    <div className={`${styles.container} ${styles.globalBody}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
            className="p-4 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 inline-block shadow-md mb-6"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-800 mb-2"
          >
            Virtual Try-On Studio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Experience the future of online shopping with our AI-powered virtual fitting room
          </motion.p>
        </header>

        <Tabs 
          defaultValue="upload" 
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="w-full">
            <AnimatePresence>
              <motion.div
                key="upload-cards"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center w-full"
              >
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto px-4 justify-center items-center lg:items-stretch">
                  <Card className="flex-1">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                      <div className="flex items-center space-x-3">
                        <User className="h-6 w-6 text-blue-500" />
                        <CardTitle className="text-lg">Your Photo</CardTitle>
                      </div>
                      <CardDescription className="mt-1 text-gray-600 text-sm">
                        {!personImage ? "Upload a full-body photo with a clear background" : "Click to change or drag a new photo"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <UploadBox 
                        type="person" 
                        image={personImage} 
                        setImage={setPersonImage} 
                        handleFileUpload={handleFileUpload}
                      />
                    </CardContent>
                  </Card>

                  <Card className="flex-1">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                      <div className="flex items-center space-x-3">
                        <Shirt className="h-6 w-6 text-purple-500" />
                        <CardTitle className="text-lg">Garment</CardTitle>
                      </div>
                      <CardDescription className="mt-1 text-gray-600 text-sm">
                        {!garmentImage ? "Upload a photo of the garment you want to try on" : "Click to change or drag a new garment"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <UploadBox 
                        type="garment" 
                        image={garmentImage} 
                        setImage={setGarmentImage} 
                        handleFileUpload={handleFileUpload}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="flex-1 border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                      <div className="flex items-center space-x-3">
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                        <div>
                          <CardTitle className="text-lg">Your Virtual Try-On</CardTitle>
                          <CardDescription className="text-gray-600">
                            {generatedImage ? "Here's your result" : "Your virtual try-on will appear here"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50/50 rounded-lg">
                        {isProcessing ? (
                          <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                            <p className="text-gray-600">Generating your virtual try-on...</p>
                          </div>
                        ) : generatedImage ? (
                          <div className="relative w-full max-w-md">
                            <img 
                              src={generatedImage.src} 
                              alt="Virtual try-on result" 
                              className="w-full h-auto rounded-lg shadow-md"
                            />
                            <div className="mt-4 flex gap-3 justify-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleDownload}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleShare}
                                className="gap-2"
                              >
                                <Share2 className="h-4 w-4" />
                                Share
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-8 max-w-md">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No try-on generated yet</h3>
                            <p className="text-sm text-gray-500 mb-6">
                              Upload your photo and a garment to see the magic happen!
                            </p>
                            <Button 
                              onClick={handleGenerate} 
                              disabled={!personImage || !garmentImage || isProcessing}
                              className="gap-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              Generate Virtual Try-On
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="gallery" className="w-full">
            <div className="w-full max-w-6xl mx-auto px-4">
              <h2 className="text-xl font-semibold mb-6">Your Previous Try-Ons</h2>
              {savedTryOns.length > 0 ? (
                <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4">
                  {savedTryOns.map((tryOn, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="relative aspect-square">
                        <img 
                          src={tryOn.image} 
                          alt={`Try-on ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="flex gap-2 w-full">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 bg-white/90 hover:bg-white"
                              onClick={() => handleDownloadGallery(tryOn.image)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 bg-white/90 hover:bg-white"
                              onClick={() => handleShare(tryOn.image)}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600">
                          {new Date(tryOn.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No saved try-ons yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Your generated try-ons will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="webcam" className="w-full">
            <div className="flex flex-col items-center space-y-6 p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold text-gray-800">Webcam Try-On</h3>
                <p className="text-gray-500 max-w-md mx-auto">Coming soon! Use your webcam for instant virtual try-ons.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button disabled variant="outline" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notify Me
                </Button>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images Instead
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VirtualTryOn;
