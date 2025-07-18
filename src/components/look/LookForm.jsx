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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Look' : 'Upload New Look'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Images (1-4 photos)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {imagePreview.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Image</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Describe your look..."
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label>Mood</Label>
            <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mood" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map(mood => (
                  <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., streetwear, casual)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    #{tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Color Palette (Optional) */}
          <div className="space-y-2">
            <Label>Color Palette (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="w-20"
              />
              <Button type="button" onClick={addColor} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.colorPalette.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.colorPalette.map((color, index) => (
                  <div 
                    key={index} 
                    className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300 relative"
                    style={{ backgroundColor: color }}
                    onClick={() => removeColor(color)}
                  >
                    <X className="h-3 w-3 absolute top-0 right-0 text-white bg-red-500 rounded-full" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Uploading...' : initialData ? 'Update Look' : 'Upload Look'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
