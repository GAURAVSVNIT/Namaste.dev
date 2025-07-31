'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadPortfolioImage, removePortfolioImage } from '@/lib/consultation-firebase';
import { getUserProfile } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, X, Plus, Image, Video, FileText, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';

const PortfolioManager = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState({ images: [], videos: [], description: '', achievements: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProfile = await getUserProfile(user.uid);
      if (userProfile?.portfolio) {
        setPortfolio(userProfile.portfolio);
        setDescription(userProfile.portfolio.description || '');
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (!user) return;

    try {
      setUploading(true);
      
      for (const file of acceptedFiles) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
            variant: 'destructive'
          });
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an image file.`,
            variant: 'destructive'
          });
          continue;
        }

        const metadata = {
          title: file.name.split('.')[0],
          description: '',
          tags: [],
          category: 'general'
        };

        const imageData = await uploadPortfolioImage(user.uid, file, metadata);
        
        setPortfolio(prev => ({
          ...prev,
          images: [...prev.images, imageData]
        }));

        toast({
          title: 'Success',
          description: `${file.name} uploaded successfully.`
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload one or more files.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading
  });

  const handleRemoveImage = async (imageId, imageUrl) => {
    try {
      await removePortfolioImage(user.uid, imageId, imageUrl);
      
      setPortfolio(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));

      toast({
        title: 'Success',
        description: 'Image removed successfully.'
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateDescription = async () => {
    try {
      // Update description logic would go here
      setEditingDescription(false);
      toast({
        title: 'Success',
        description: 'Portfolio description updated.'
      });
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: 'Error',
        description: 'Failed to update description.',
        variant: 'destructive'
      });
    }
  };

  const ImageCard = ({ image, index }) => (
    <Card className="group relative overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={image.url}
          alt={image.title || `Portfolio ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" onClick={() => setSelectedImage(image)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{image.title || 'Portfolio Image'}</DialogTitle>
                  {image.description && (
                    <DialogDescription>{image.description}</DialogDescription>
                  )}
                </DialogHeader>
                <div className="mt-4">
                  <img
                    src={image.url}
                    alt={image.title || 'Portfolio Image'}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {image.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove this image from your portfolio? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRemoveImage(image.id, image.url)}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
      <CardContent className="p-3">
        <h4 className="font-medium text-sm truncate">{image.title || 'Untitled'}</h4>
        {image.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {image.description}
          </p>
        )}
        {image.uploadedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(image.uploadedAt.seconds * 1000).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Description */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Portfolio Description</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingDescription(!editingDescription)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editingDescription ? (
            <div className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your portfolio, style, and expertise..."
                rows={4}
              />
              <div className="flex space-x-2">
                <Button onClick={handleUpdateDescription}>Save</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingDescription(false);
                    setDescription(portfolio.description || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {portfolio.description || 'No description added yet. Click Edit to add one.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Images</span>
          </CardTitle>
          <CardDescription>
            Upload images of your work to showcase your portfolio. Supported formats: JPEG, PNG, GIF, WebP (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {uploading ? (
              <p>Uploading...</p>
            ) : isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  You can upload multiple images at once
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Gallery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5" />
                <span>Portfolio Gallery</span>
              </CardTitle>
              <CardDescription>
                {portfolio.images.length} {portfolio.images.length === 1 ? 'image' : 'images'} in your portfolio
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {portfolio.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolio.images.map((image, index) => (
                <ImageCard key={image.id} image={image} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No images yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your portfolio by uploading images of your work
              </p>
              <Button onClick={() => document.querySelector('input[type="file"]')?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Image className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{portfolio.images.length}</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{portfolio.videos?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{portfolio.achievements?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioManager;
