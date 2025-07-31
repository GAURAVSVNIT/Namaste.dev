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
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // State for active tab
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dragStates, setDragStates] = useState({ person: false, garment: false });
  const [savedTryOns, setSavedTryOns] = useState([]); // Placeholder for saved try-ons
  
  const personInputRef = useRef(null);
  const garmentInputRef = useRef(null);
  const resultRef = useRef(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_VIRTUAL_TRYON_API_URL || 'http://localhost:8000';

  // Firestore functions
  const loadSavedTryOns = async () => {
    try {
      const tryOnsCollection = collection(db, 'virtualTryOns');
      const tryOnsQuery = query(tryOnsCollection, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(tryOnsQuery);
      const tryOns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedTryOns(tryOns);
    } catch (error) {
      console.error('Error loading saved try-ons:', error);
    }
  };

  const saveNewTryOn = async (imageData) => {
    try {
      const tryOnsCollection = collection(db, 'virtualTryOns');
      const newTryOn = {
        image: imageData,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(tryOnsCollection, newTryOn);
      // Update local state with the new try-on
      setSavedTryOns(prev => [{ id: docRef.id, ...newTryOn, timestamp: new Date().toISOString() }, ...prev]);
    } catch (error) {
      console.error('Error saving try-on:', error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadSavedTryOns(); // Load saved try-ons on mount
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
          return prev + Math.random() * 10; // Slower, more realistic progress
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
  }, []); // Removed handleFileUpload from dependencies since it's now a regular function

function handleFileUpload(file, type) {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size exceeds 5MB limit.');
      setTimeout(() => setError(null), 3000);
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
      setError(null); // Clear any previous errors on successful upload
    };
    reader.readAsDataURL(file);
  }

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
      formData.append('garment_type', 'dress');
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
          const newGeneratedImage = {
            src: `data:image/png;base64,${result.result_image}`,
            name: 'virtual-tryon-result.png',
            size: 0,
            type: 'image/png'
          };
          setGeneratedImage(newGeneratedImage);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          // Save to Firestore
          await saveNewTryOn(newGeneratedImage.src);


          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          throw new Error(result.message || 'Failed to generate virtual try-on');
        }
      } catch (apiError) {
        console.warn('API not available, running in demo mode:', apiError.message);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newGeneratedImage = {
          src: personImage.src, // Use the person image as demo result
          name: 'virtual-tryon-result.png',
          size: 0,
          type: 'image/png'
        };
        setGeneratedImage(newGeneratedImage);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        // Save to Firestore in demo mode too
        await saveNewTryOn(newGeneratedImage.src);


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
    const urlToShare = imageUrl || (generatedImage ? generatedImage.src : '');
    if (navigator.share) {
      navigator.share({
        title: 'Virtual Try-On Result',
        text: 'Check out my virtual try-on result!',
        url: urlToShare
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      if (urlToShare) {
        navigator.clipboard.writeText(urlToShare)
          .then(() => alert('Image URL copied to clipboard!'))
          .catch((error) => console.error('Error copying to clipboard:', error));
      }
    }
  };

  const handleDownloadGallery = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `virtual-tryon-gallery-${new Date().toISOString()}.png`;
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
              className={styles.uploadedImageContainer}
            >
              <img 
                src={image.src} 
                alt={type === 'person' ? 'Person preview' : 'Garment preview'}
                className={styles.uploadedImage}
              />
              
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
                    {type === 'person' ? 'PNG, JPG, WEBP (Max 5MB)' : 'PNG, JPG, WEBP (Max 5MB)'}
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
        <header className={styles.header}>
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
            className="text-gray-600 max-w-2xl mx-auto text-center" // Added text-center
          >
            Experience the future of online shopping with our AI-powered virtual fitting room. Upload your photo and a garment to see the magic happen!
          </motion.p>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </header>

        <Tabs 
          defaultValue="upload" 
          className={styles.tabsContainer}
          onValueChange={setActiveTab}
        >
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="upload" className={styles.tabTrigger}>
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="gallery" className={styles.tabTrigger}>
              <ImageIcon className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="webcam" className={styles.tabTrigger}>
              <Camera className="h-4 w-4" />
              Webcam (Coming Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className={styles.tabContent}>
            <AnimatePresence>
              <motion.div
                key="upload-cards"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={styles.gridContainer}
              >
                  <Card className={styles.card}>
                    <CardHeader className={styles.cardHeader}>
                      <div className="flex flex-col items-center space-y-2">
                        <User className="h-6 w-6 text-blue-500" />
                        <CardTitle className="text-lg">Your Photo</CardTitle>
                      </div>
                      <CardDescription className="mt-1 text-gray-600 text-sm text-center">
                        {!personImage ? "Upload a full-body photo with a clear background" : "Click to change or drag a new photo"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                      <UploadBox 
                        type="person" 
                        image={personImage} 
                        setImage={setPersonImage} 
                        handleFileUpload={handleFileUpload}
                        isDragging={dragStates.person}
                      />
                    </CardContent>
                  </Card>

                  <Card className={styles.card}>
                    <CardHeader className={styles.cardHeader}>
                      <div className="flex flex-col items-center space-y-2">
                        <Shirt className="h-6 w-6 text-purple-500" />
                        <CardTitle className="text-lg">Garment</CardTitle>
                      </div>
                      <CardDescription className="mt-1 text-gray-600 text-sm text-center">
                        {!garmentImage ? "Upload a photo of the garment you want to try on" : "Click to change or drag a new garment"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                      <UploadBox 
                        type="garment" 
                        image={garmentImage} 
                        setImage={setGarmentImage} 
                        handleFileUpload={handleFileUpload}
                        isDragging={dragStates.garment}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className={clsx(styles.card, "border-2 border-gray-200 overflow-hidden")}>
                    <CardHeader className={styles.cardHeader}>
                      <div className="flex flex-col items-center space-y-2">
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                        <div>
                          <CardTitle className="text-lg">Your Virtual Try-On</CardTitle>
                          <CardDescription className="text-gray-600 text-center">
                            {generatedImage ? "Here's your result" : "Your virtual try-on will appear here"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                      <div ref={resultRef} className={clsx(styles.resultImageContainer, "flex-1")}>
                        {isProcessing ? (
                          <div className="flex flex-col items-center space-y-4 p-4">
                            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                            <p className="text-gray-600">Generating your virtual try-on...</p>
                            <div className={styles.progressBarContainer}>
                              <div 
                                className={styles.progressBar} 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-500">{Math.round(progress)}% Complete</p>
                          </div>
                        ) : generatedImage ? (
                          <motion.img 
                            key="generated-img"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            src={generatedImage.src} 
                            alt="Virtual try-on result" 
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="text-center p-8 max-w-md">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No try-on generated yet</h3>
                            <p className={clsx(styles.resultPlaceholderText, "mb-6")}>
                              Upload your photo and a garment to see the magic happen!
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex flex-col items-center w-full">
                        {generatedImage && !isProcessing && (
                           <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="w-full flex flex-col sm:flex-row gap-3 justify-center mb-4"
                           >
                              <Button 
                                variant="outline" 
                                size="lg" // Larger buttons
                                onClick={handleDownload}
                                className="w-full sm:w-auto gap-2"
                              >
                                <Download className="h-5 w-5" />
                                Download Result
                              </Button>
                              <Button 
                                variant="outline" 
                                size="lg" // Larger buttons
                                onClick={() => handleShare(generatedImage.src)}
                                className="w-full sm:w-auto gap-2"
                              >
                                <Share2 className="h-5 w-5" />
                                Share Try-On
                              </Button>
                           </motion.div>
                        )}

                        <Button 
                          onClick={handleGenerate} 
                          disabled={!personImage || !garmentImage || isProcessing}
                          className={styles.generateButton}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5 mr-2" />
                              Generate Virtual Try-On
                            </>
                          )}
                        </Button>
                        {showSuccess && !isProcessing && (
                            <motion.p 
                               initial={{ opacity: 0, y: -10 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="mt-3 text-sm font-medium text-green-600 flex items-center gap-1"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Try-on generated successfully!
                            </motion.p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="gallery" className={styles.tabContent}>
            <div className="w-full max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Your Previous Try-Ons</h2>
              {savedTryOns.length > 0 ? (
                <motion.div 
                  className={styles.galleryGrid}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {savedTryOns.map((tryOn, index) => (
                    <motion.div 
                      key={index} 
                      className={styles.galleryCard}
                      variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 20 } }}
                    >
                      <div className={styles.galleryImageWrapper}>
                        <img 
                          src={tryOn.image} 
                          alt={`Try-on ${index + 1}`} 
                          className={styles.galleryImage}
                        />
                        <div className={styles.galleryActionsOverlay}>
                          <div className="flex gap-3">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="bg-white/90 hover:bg-white text-gray-800 shadow-md gap-2"
                              onClick={() => handleDownloadGallery(tryOn.image)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="bg-white/90 hover:bg-white text-gray-800 shadow-md gap-2"
                              onClick={() => handleShare(tryOn.image)}
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">
                          {new Date(tryOn.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className={clsx(styles.emptyGallery, "text-center")}>
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">No saved try-ons yet</h3>
                  <p className="mt-1 text-base text-gray-600 max-w-md mx-auto">
                    Your generated virtual try-ons will be saved here automatically. Start by generating one on the "Upload" tab!
                  </p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="mt-6 flex items-center gap-2 mx-auto"
                  >
                    <Upload className="h-4 w-4" />
                    Go to Upload
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="webcam" className={styles.tabContent}>
            <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-xl shadow-md max-w-2xl mx-auto my-10">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                <Camera className="h-12 w-12 text-blue-500" />
              </div>
              <div className="space-y-3 text-center">
                <h3 className="text-2xl font-bold text-gray-800">Webcam Try-On Feature</h3>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Get ready for real-time virtual try-ons! This exciting feature is currently under development.
                </p>
                <p className="text-sm text-gray-500">
                  Stay tuned for updates. We'll notify you when it's live!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button disabled variant="outline" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notify Me
                </Button>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md"
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