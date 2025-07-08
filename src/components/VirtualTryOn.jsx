"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Settings, Bug, ChevronDown, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragStates, setDragStates] = useState({ person: false, garment: false });
  const [debugLogs, setDebugLogs] = useState([
    '[INFO] Virtual Try-On Interface initialized',
    '[INFO] Ready to process images',
    '[INFO] Upload person and garment images to begin'
  ]);

  // Advanced options state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [modelResolution, setModelResolution] = useState('768');
  const [inferenceSteps, setInferenceSteps] = useState([30]);
  const [guidanceScale, setGuidanceScale] = useState([2.5]);
  const [garmentType, setGarmentType] = useState('upper_body');
  const [modelType, setModelType] = useState('viton_hd');
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [enhanceDetails, setEnhanceDetails] = useState(false);

  const personInputRef = useRef(null);
  const garmentInputRef = useRef(null);

  // Example images data
  const personExamples = [
    { id: 1, label: 'Fashion Model 1', src: '/api/placeholder/150/200' },
    { id: 2, label: 'Casual Style', src: '/api/placeholder/150/200' },
    { id: 3, label: 'Professional Look', src: '/api/placeholder/150/200' },
    { id: 4, label: 'Street Style', src: '/api/placeholder/150/200' },
    { id: 5, label: 'Elegant Pose', src: '/api/placeholder/150/200' },
  ];

  const garmentExamples = [
    { id: 1, label: 'Summer Dress', category: 'dress', src: '/api/placeholder/150/200' },
    { id: 2, label: 'Casual T-Shirt', category: 'top', src: '/api/placeholder/150/200' },
    { id: 3, label: 'Blazer Jacket', category: 'jacket', src: '/api/placeholder/150/200' },
    { id: 4, label: 'Denim Jeans', category: 'bottom', src: '/api/placeholder/150/200' },
    { id: 5, label: 'Hoodie', category: 'top', src: '/api/placeholder/150/200' },
  ];

  const addDebugLog = useCallback((level, message) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp}] [${level}] ${message}`;
    setDebugLogs(prev => [...prev.slice(-10), newLog]);
  }, []);

  const handleDrag = useCallback((e, type) => {
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
      addDebugLog('ERROR', 'Please select a valid image file');
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
        addDebugLog('SUCCESS', `Person image uploaded: ${file.name}`);
      } else {
        setGarmentImage(imageData);
        addDebugLog('SUCCESS', `Garment image uploaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  }, [addDebugLog]);

  const handleExampleClick = useCallback((example, type) => {
    const imageData = {
      src: example.src,
      name: example.label,
      isExample: true
    };

    if (type === 'person') {
      setPersonImage(imageData);
      addDebugLog('INFO', `Loaded example person: ${example.label}`);
    } else {
      setGarmentImage(imageData);
      addDebugLog('INFO', `Loaded example garment: ${example.label}`);
    }
  }, [addDebugLog]);

  // Helper function to convert image to blob
  const imageToBlob = async (imageData) => {
    if (imageData.isExample) {
      // For example images, we need to fetch them first
      const response = await fetch(imageData.src);
      return await response.blob();
    } else {
      // Convert base64 to blob
      const response = await fetch(imageData.src);
      return await response.blob();
    }
  };

  const generateTryOn = useCallback(async () => {
    if (!personImage || !garmentImage) {
      addDebugLog('ERROR', 'Please upload both person and garment images');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    addDebugLog('INFO', 'Starting virtual try-on generation...');

    try {
      // Convert images to blobs for FormData
      addDebugLog('INFO', 'Preparing images for upload...');
      setProgress(10);
      
      const personBlob = await imageToBlob(personImage);
      const garmentBlob = await imageToBlob(garmentImage);
      
      addDebugLog('INFO', 'Uploading to AI server...');
      setProgress(20);

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('person_image', personBlob, 'person.jpg');
      formData.append('garment_image', garmentBlob, 'garment.jpg');
      formData.append('garment_type', garmentType);
      formData.append('model_type', modelType);
      formData.append('steps', inferenceSteps[0].toString());
      formData.append('guidance_scale', guidanceScale[0].toString());
      formData.append('seed', '42');

      addDebugLog('INFO', 'Processing with AI model...');
      setProgress(30);

      // Make API call to FastAPI server
      const response = await fetch('http://127.0.0.1:8000/virtual-tryon', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      addDebugLog('INFO', 'Receiving generated image...');
      setProgress(80);

      const result = await response.json();
      
      if (result.success) {
        // Convert base64 image back to displayable format
        const resultImage = {
          src: `data:image/png;base64,${result.result_image}`,
          name: 'generated-tryon.png',
          isGenerated: true
        };

        setGeneratedImage(resultImage);
        setProgress(100);
        addDebugLog('SUCCESS', 'Virtual try-on generation completed!');
        addDebugLog('INFO', 'Ready for download or new generation');
      } else {
        throw new Error('API returned unsuccessful result');
      }
      
    } catch (error) {
      addDebugLog('ERROR', `Generation failed: ${error.message}`);
      if (error.message.includes('Failed to fetch')) {
        addDebugLog('ERROR', 'Could not connect to AI server. Make sure the FastAPI server is running on http://127.0.0.1:8000');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [personImage, garmentImage, inferenceSteps, guidanceScale, garmentType, modelType, addDebugLog]);

  const UploadBox = ({ type, image, isDragging }) => (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-primary bg-blush/20 scale-[1.02]' : 'border-border/30 hover:border-primary/50'}
        ${image ? 'border-solid border-primary/30' : ''}
        backdrop-blur-sm bg-white/5`}
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={(e) => handleDrag(e, type)}
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
        <div className="relative group">
          <img 
            src={image.src} 
            alt={image.name}
            className="w-full h-80 object-cover rounded-lg"
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
            {image.isExample ? 'Example' : 'Uploaded'}
          </Badge>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Drop Image Here</p>
            <p className="text-sm text-muted-foreground">- or -</p>
            <p className="text-sm text-muted-foreground">Click to Upload</p>
          </div>
        </div>
      )}
    </div>
  );

  const ExampleGrid = ({ examples, type }) => (
    <div className="space-y-3 w-full">
      <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Examples</h4>
      <div className="flex gap-2 justify-center overflow-x-auto pb-2" style={{ display: 'flex', gap: '10px', overflowX: 'auto', justifyContent: 'center' }}>
        {examples.map((example) => (
          <div
            key={example.id}
            className="flex-shrink-0 w-16 h-20 cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden"
            style={{ 
              borderRadius: '10px', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e5e5',
              backgroundColor: '#fff'
            }}
            onClick={() => handleExampleClick(example, type)}
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xs text-center p-1 text-gray-700">
              {example.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-4xl font-bold text-gray-800" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>
          Virtual Try-On Studio
        </h2>
        <p className="text-gray-600 text-lg">
          Upload a person image and garment to generate a virtual try-on
        </p>
      </div>

      {/* Main Interface */}
      <div className="grid lg:grid-cols-3 gap-6" style={{ gap: '1.5rem' }}>
        {/* Person Image Column */}
        <div className="space-y-6">
          <Card className="bg-white/95 border-0 shadow-lg" style={{ backgroundColor: '#f9f9f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', minHeight: '600px' }}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                🧍 Person Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="w-full max-w-xs">
                <UploadBox 
                  type="person" 
                  image={personImage} 
                  isDragging={dragStates.person}
                />
              </div>
              <ExampleGrid examples={personExamples} type="person" />
            </CardContent>
          </Card>
        </div>

        {/* Garment Image Column */}
        <div className="space-y-6">
          <Card className="bg-white/95 border-0 shadow-lg" style={{ backgroundColor: '#f9f9f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', minHeight: '600px' }}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                👕 Garment Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="w-full max-w-xs">
                <UploadBox 
                  type="garment" 
                  image={garmentImage} 
                  isDragging={dragStates.garment}
                />
              </div>
              <ExampleGrid examples={garmentExamples} type="garment" />
            </CardContent>
          </Card>
        </div>

        {/* Generated Image Column with Controls Below */}
        <div className="space-y-6">
          {/* Generated Image Card */}
          <Card className="bg-white/95 border-0 shadow-lg" style={{ backgroundColor: '#f9f9f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '15px', padding: '20px', minHeight: '600px' }}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                🖼️ Generated Image
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-full max-w-xs">
                {generatedImage ? (
                  <div className="relative group">
                    <img 
                      src={generatedImage.src} 
                      alt="Generated try-on"
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = generatedImage.src;
                          link.download = generatedImage.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          addDebugLog('INFO', 'Generated image downloaded');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted/30">
                    <div className="text-center space-y-2">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground text-sm">Generated image will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Generate Button */}
          <div className="space-y-4">
            <Button 
              onClick={generateTryOn}
              disabled={!personImage || !garmentImage || isProcessing}
              className="w-full h-14 text-white border-0"
              style={{
                background: 'linear-gradient(to right, #ff6fb1, #a072f8)',
                borderRadius: '10px',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: '0.2s ease'
              }}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate
                </>
              )}
            </Button>
            
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">{progress}% Complete</p>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <Card className="bg-white/95 border-0 shadow-lg" style={{ backgroundColor: '#f9f9f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '15px' }}>
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-gray-800">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Advanced Options
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Model Type</Label>
                      <Select value={modelType} onValueChange={setModelType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viton_hd">VITON-HD (Recommended)</SelectItem>
                          <SelectItem value="dress_code">DressCode (Experimental)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Garment Type</Label>
                      <Select value={garmentType} onValueChange={setGarmentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upper_body">Upper Body</SelectItem>
                          <SelectItem value="lower_body">Lower Body</SelectItem>
                          <SelectItem value="dresses">Dress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Model Resolution</Label>
                      <Select value={modelResolution} onValueChange={setModelResolution}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512x512</SelectItem>
                          <SelectItem value="768">768x768</SelectItem>
                          <SelectItem value="1024">1024x1024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Inference Steps: {inferenceSteps[0]}</Label>
                      <Slider
                        value={inferenceSteps}
                        onValueChange={setInferenceSteps}
                        min={20}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Guidance Scale: {guidanceScale[0]}</Label>
                      <Slider
                        value={guidanceScale}
                        onValueChange={setGuidanceScale}
                        min={1}
                        max={20}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="preserve-bg"
                          checked={preserveBackground}
                          onCheckedChange={setPreserveBackground}
                        />
                        <Label htmlFor="preserve-bg">Preserve Background</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enhance-details"
                          checked={enhanceDetails}
                          onCheckedChange={setEnhanceDetails}
                        />
                        <Label htmlFor="enhance-details">Enhance Details</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Debug Section */}
          <Card className="bg-white/95 border-0 shadow-lg" style={{ backgroundColor: '#f9f9f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '15px' }}>
            <Collapsible open={debugOpen} onOpenChange={setDebugOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-gray-800">
                    <div className="flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Debug
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${debugOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm space-y-1">
                    {debugLogs.map((log, index) => (
                      <div key={index} className="text-xs">
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
