"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Sparkles, User, Shirt, Image as ImageIcon, Loader2, Download, Camera, RefreshCw, CheckCircle, AlertCircle, Bell, ChevronDown, Share2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './VirtualTryOn.module.css';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } }
};

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragStates, setDragStates] = useState({ person: false, garment: false });
  const [error, setError] = useState(null);
  const [garmentType, setGarmentType] = useState('upper_body');
  const [modelType, setModelType] = useState('viton_hd');
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [showSuccess, setShowSuccess] = useState(false);

  const personInputRef = useRef(null);
  const garmentInputRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Simulate progress for demo purposes
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

  const handleGenerate = async () => {
    if (!personImage || !garmentImage || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setShowSuccess(false);
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

      // Simulate API call with timeout for demo
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock success response for demo
      const mockSuccess = true;
      
      if (mockSuccess) {
        setGeneratedImage({
          src: personImage.src, // In production, use the actual generated image
          name: 'virtual-tryon-result.png',
          size: 0,
          type: 'image/png'
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Scroll to result
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        throw new Error('Failed to generate virtual try-on. Please try again.');
      }
      
      /* 
      // Uncomment this block for actual API call in production
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
          name: 'virtual-tryon-result.png',
          size: 0,
          type: 'image/png'
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Scroll to result
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        throw new Error(result.message || 'Failed to generate virtual try-on');
      }
      */
    } catch (err) {
      console.error('Error generating virtual try-on:', err);
      setError(err.message || 'Failed to generate virtual try-on. Please try again.');
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const UploadBox = ({ type, image, isDragging }) => (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[300px] group overflow-hidden",
        isDragging ? "border-blue-500 bg-blue-50/30 scale-[1.01] shadow-lg" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/10",
        image ? "border-solid border-blue-400 bg-gradient-to-br from-blue-50/20 to-purple-50/10" : "bg-gray-50",
        "hover:shadow-md backdrop-blur-sm"
      )}
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={handleDrag}
      onDragEnter={(e) => handleDragIn(e, type)}
      onDragLeave={(e) => handleDragOut(e, type)}
      onClick={() => type === 'person' ? personInputRef.current?.click() : garmentInputRef.current?.click()}
      aria-label={type === 'person' ? 'Upload person image' : 'Upload garment image'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (type === 'person') personInputRef.current?.click();
          else garmentInputRef.current?.click();
        }
      }}
    >
      <input
        type="file"
        ref={type === 'person' ? personInputRef : garmentInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], type)}
        accept="image/*"
        className="hidden"
        disabled={isProcessing}
        aria-label={type === 'person' ? 'Select person image' : 'Select garment image'}
      />
      
      {image ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full group/image"
        >
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <img 
              src={image.src} 
              alt={type === 'person' ? 'Person preview' : 'Garment preview'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
            />
          </div>
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (type === 'person') setPersonImage(null);
                else setGarmentImage(null);
              }}
              className="bg-white/90 hover:bg-white text-gray-800 shadow-lg mb-2 backdrop-blur-sm"
              aria-label="Change image"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Image
            </Button>
            <p className="text-xs text-white/80 text-center px-4">
              {type === 'person' 
                ? 'Make sure your whole body is visible'
                : 'Ensure the garment is clearly visible'}
            </p>
          </div>
          
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-800 border border-gray-200 shadow-sm backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Uploaded
            </Badge>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-700 truncate shadow-sm">
            <p className="truncate">{image.name}</p>
            <p className="text-xs text-gray-500">{(image.size / 1024).toFixed(1)} KB</p>
          </div>
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
    </motion.div>
  );

  if (!isMounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Header Section */}
        <header className={styles.header}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
            className={styles.headerIcon}
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.title}
          >
            Virtual Try-On Studio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.subtitle}
          >
            Experience the future of online shopping with our AI-powered virtual fitting room
          </motion.p>
        </header>

        {/* Main Content */}
        <Tabs 
          defaultValue="upload" 
          className="w-full"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className={styles.tabsContainer}>
            <TabsTrigger 
              value="upload" 
              className={styles.tabTrigger}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </TabsTrigger>
            <TabsTrigger 
              value="webcam" 
              className={styles.tabTrigger}
              disabled={true}
            >
              <Camera className="h-4 w-4 mr-2" />
              <span style={{ position: 'relative' }}>
                Webcam
                <span className={styles.soonBadge}>
                  Soon
                </span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="w-full">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
            >
              {/* Person Image Upload */}
              <motion.div variants={fadeIn} className="h-full">
                <Card className="border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-800">Your Photo</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Full-body photo works best
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <UploadBox 
                        type="person" 
                        image={personImage} 
                        isDragging={dragStates.person}
                      />
                    </div>
                    {!personImage && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">
                          <span className="font-medium">Tip:</span> Stand straight with arms slightly away from body
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Garment Image Upload */}
              <motion.div variants={fadeIn} className="h-full">
                <Card className="border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                        <Shirt className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-800">Garment</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          The item you want to try on
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <UploadBox 
                        type="garment" 
                        image={garmentImage} 
                        isDragging={dragStates.garment}
                      />
                    </div>
                  
                    {/* Configuration Options */}
                    <div className="mt-6 space-y-4 bg-gray-50/50 p-4 rounded-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Garment Type</label>
                          <span className="text-xs text-gray-400">What are you trying on?</span>
                        </div>
                        <select 
                          value={garmentType} 
                          onChange={(e) => setGarmentType(e.target.value)}
                          disabled={isProcessing}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm transition-all"
                        >
                          <option value="upper_body">👕 Tops & Shirts</option>
                          <option value="lower_body">👖 Pants & Skirts</option>
                          <option value="dresses">👗 Dresses</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">AI Model</label>
                          <span className="text-xs text-gray-400">Advanced settings</span>
                        </div>
                        <select 
                          value={modelType} 
                          onChange={(e) => setModelType(e.target.value)}
                          disabled={isProcessing}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm transition-all"
                        >
                          <option value="viton_hd">✨ VITON-HD (Recommended)</option>
                          <option value="dress_code">👗 DressCode (For Dresses)</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500 bg-blue-50/50 p-2 rounded-lg">
                          <span className="font-medium">Tip:</span> {modelType === 'viton_hd' 
                            ? 'Best for shirts, jackets, and upper body garments' 
                            : 'Optimized for dresses and full-body outfits'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            {/* Generated Result */}
            <motion.div 
              variants={fadeIn}
              className="h-full"
              ref={resultRef}
            >
              <Card className="border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-800">Your Virtual Try-On</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {generatedImage ? 'Here\'s your result' : 'Your virtual try-on will appear here'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isProcessing ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 px-4"
                    >
                      <div className="relative w-20 h-20 mb-6">
                        <motion.div 
                          className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-2 rounded-full border-4 border-blue-100 border-t-transparent"></div>
                        <div className="absolute inset-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
                        </div>
                      </div>
                      <motion.h3 
                        className="text-lg font-medium text-gray-800 mb-1 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Crafting your perfect look...
                      </motion.h3>
                      <motion.p 
                        className="text-sm text-gray-500 mb-6 text-center max-w-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Our AI is working its magic to create your virtual try-on. This usually takes about 15-30 seconds.
                      </motion.p>
                      
                      <div className="w-full max-w-md space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Processing</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            initial={{ width: '10%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Uploading images</span>
                          <span className="text-xs text-gray-400">Generating result</span>
                        </div>
                      </div>
                      
                      {progress > 30 && (
                        <motion.div 
                          className="mt-8 text-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <p className="text-xs text-gray-400 mb-2">This might take a moment. Feel free to grab a coffee!</p>
                          <div className="flex justify-center gap-1">
                            {[0, 0.3, 0.6].map((delay) => (
                              <motion.div
                                key={delay}
                                className="h-1.5 w-1.5 bg-blue-400 rounded-full"
                                animate={{ y: [0, -10, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  delay: delay,
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                        whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                      >
                        <img 
                          src={generatedImage.src}
                          alt="Virtual try-on result"
                          className="w-full h-auto"
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="text-center py-12 px-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to see the magic?</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        Upload both images and click "Generate Virtual Try-On" to see how you look in your chosen outfit.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

        {/* Generate Button */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          <Button 
            onClick={handleGenerate}
            disabled={!personImage || !garmentImage || isProcessing}
            className="w-full max-w-md h-12 text-base font-medium transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg disabled:opacity-70 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                <span>Generate Virtual Try-On</span>
              </>
            )}
          </Button>
          
          {(!personImage || !garmentImage) && (
            <motion.p 
              className="text-sm text-gray-500 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {!personImage && !garmentImage 
                ? 'Upload both images to continue' 
                : !personImage 
                  ? 'Upload a person image to continue' 
                  : 'Upload a garment image to continue'}
            </motion.p>
          )}
        </div>
          </TabsContent>
          <TabsContent value="webcam" className="text-center py-12">
            <motion.div 
              className="flex flex-col items-center space-y-6 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Webcam Try-On</h3>
                <p className="text-gray-500 max-w-md">Coming soon! Use your webcam for instant virtual try-ons.</p>
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
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VirtualTryOn;
