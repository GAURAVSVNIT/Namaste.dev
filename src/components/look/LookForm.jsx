'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadLookImages, createLook, MOODS } from '@/lib/look';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LookForm({ onSubmit, onCancel, initialData = null }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    caption: initialData?.caption || '',
    mood: initialData?.mood || '',
    tags: initialData?.tags || [],
    colorPalette: initialData?.colorPalette || []
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const [imagePreview, setImagePreview] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [colorInput, setColorInput] = useState('#000000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize image preview with existing images
  useEffect(() => {
    if (initialData?.images) {
      setImagePreview(initialData.images);
    }
  }, [initialData]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 4 images total (existing + new)
    if (existingImages.length + images.length + files.length > 4) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 4 images",
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload only JPEG, PNG, or WebP images",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Add new images
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const adjustedIndex = index - existingImages.length;
      setImages((prev) => prev.filter((_, i) => i !== adjustedIndex));
    }
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addColor = () => {
    if (colorInput && !formData.colorPalette.includes(colorInput)) {
      setFormData(prev => ({
        ...prev,
        colorPalette: [...prev.colorPalette, colorInput]
      }));
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      colorPalette: prev.colorPalette.filter(color => color !== colorToRemove)
    }));
  };

  const validateForm = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload looks",
        variant: "destructive",
      });
      return false;
    }

    // Check if there are any images (existing or new)
    if (existingImages.length === 0 && images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please add a caption for your look",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.mood) {
      toast({
        title: "Mood Required",
        description: "Please select a mood for your look",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls = [...existingImages];
      
      // Upload new images if any
      if (images.length > 0) {
        const uploadedUrls = await uploadLookImages(user.uid, images);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const lookData = {
        ...formData,
        images: imageUrls
      };

      if (initialData) {
        // Update existing look
        await onSubmit(lookData);
      } else {
        // Create new look
        if (onSubmit) {
          await onSubmit(lookData);
        } else {
          await createLook(user.uid, lookData);
        }
        toast({
          title: "Success!",
          description: "Your look has been uploaded successfully.",
        });
      }

      // Reset form
      setFormData({
        caption: '',
        mood: '',
        tags: [],
        colorPalette: []
      });
      setImages([]);
      setImagePreview([]);
      setTagInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ width: '85%', maxWidth: '1000px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '32px 40px', 
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {initialData ? '✨ Edit Your Look' : '🎨 Create Your Look'}
            </h2>
            <p style={{ 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '16px',
              margin: '0',
              lineHeight: '1.5'
            }}>
              {initialData ? 'Update and perfect your style showcase' : 'Share your unique fashion sense with our creative community'}
            </p>
          </div>
          
          {/* Form Content */}
          <div style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                  }}>
                    <ImageIcon style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: '0 0 4px 0' 
                    }}>Photos</h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      margin: '0' 
                    }}>Upload 1-4 high-quality images of your look</p>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginTop: '16px',
                  justifyContent: imagePreview.length === 0 ? 'center' : 'flex-start'
                }}>
                  {imagePreview.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', width: '150px' }}>
                      <div style={{ 
                        aspectRatio: '1', 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
                      }}>
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          fontSize: '12px'
                        }}
                      >
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  ))}
                  
                  {imagePreview.length < 4 && (
                    <label style={{ 
                      width: '120px',
                      height: '120px',
                      border: '2px dashed #d1d5db', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.3s ease',
                      padding: '12px'
                    }}>
                      <Upload style={{ width: '20px', height: '20px', color: '#9ca3af', marginBottom: '4px' }} />
                      <span style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', fontWeight: '500' }}>Add Photo</span>
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>Up to 5MB</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              {/* Caption */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                  }}>
                    <span style={{ fontSize: '20px', color: 'white' }}>✍️</span>
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: '0 0 4px 0' 
                    }}>Caption</h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      margin: '0' 
                    }}>Describe your look and inspiration</p>
                  </div>
                </div>
                <Textarea
                  id="caption"
                  placeholder="Tell us about your look... What inspired this style? How does it make you feel?"
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    resize: 'none',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    ':focus': {
                      borderColor: '#3b82f6',
                      outline: 'none'
                    }
                  }}
                  required
                />
              </div>

              {/* Mood */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#f97316', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)'
                  }}>
                    <span style={{ fontSize: '20px', color: 'white' }}>😊</span>
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: '0 0 4px 0' 
                    }}>Mood & Vibe</h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      margin: '0' 
                    }}>Select the feeling your look conveys</p>
                  </div>
                </div>
                <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                  <SelectTrigger style={{
                    height: '48px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '15px',
                    transition: 'border-color 0.2s ease'
                  }}>
                    <SelectValue placeholder="Choose your look's mood and vibe..." />
                  </SelectTrigger>
                  <SelectContent style={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}>
                    {MOODS.map(mood => (
                      <SelectItem key={mood} value={mood} style={{
                        padding: '12px 16px',
                        fontSize: '15px'
                      }}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#8b5cf6', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)'
                  }}>
                    <span style={{ fontSize: '20px', color: 'white', fontWeight: 'bold' }}>#</span>
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: '0 0 4px 0' 
                    }}>Tags</h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      margin: '0' 
                    }}>Add relevant style tags to help others discover your look</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <Input
                    placeholder="Add a tag (e.g., vintage, streetwear, casual)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    style={{
                      flex: 1,
                      height: '48px',
                      padding: '0 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={addTag} 
                    style={{
                      height: '48px',
                      padding: '0 20px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        onClick={() => removeTag(tag)}
                        style={{
                          backgroundColor: '#ddd6fe',
                          color: '#7c3aed',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        #{tag}
                        <X style={{ width: '12px', height: '12px' }} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Palette */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#ec4899', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.25)'
                  }}>
                    <span style={{ fontSize: '20px', color: 'white' }}>🎨</span>
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: '0 0 4px 0' 
                    }}>Color Palette</h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      margin: '0' 
                    }}>Add colors that represent your look (optional)</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <Input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    style={{
                      width: '48px',
                      height: '48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={addColor}
                    style={{
                      height: '48px',
                      padding: '0 20px',
                      backgroundColor: '#ec4899',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />Add Color
                  </Button>
                </div>
                {formData.colorPalette.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {formData.colorPalette.map((color, index) => (
                      <div 
                        key={index} 
                        onClick={() => removeColor(color)}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          border: '2px solid #e5e7eb',
                          position: 'relative',
                          backgroundColor: color,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#ef4444',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}>
                          <X style={{ width: '10px', height: '10px', color: 'white' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                paddingTop: '32px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      minHeight: '52px',
                      padding: '16px 24px',
                      backgroundColor: isSubmitting ? '#93c5fd' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>Publishing Your Look...</span>
                      </>
                    ) : (
                      <span>{initialData ? '✨ Update Look' : '🚀 Publish Look'}</span>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={onCancel}
                    style={{
                      flex: 1,
                      minHeight: '52px',
                      padding: '16px 24px',
                      backgroundColor: 'white',
                      color: '#6b7280',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
