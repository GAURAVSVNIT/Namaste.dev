'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLookById, updateLook } from '@/lib/look';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const moods = [
  'Happy', 'Confident', 'Playful', 'Elegant', 'Edgy', 'Romantic', 
  'Professional', 'Casual', 'Bold', 'Minimalist', 'Vintage', 'Trendy'
];

const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00', '#0000FF'
];

export default function EditLookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [look, setLook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    mood: '',
    tags: [],
    colorPalette: [],
    images: []
  });
  const [newTag, setNewTag] = useState('');
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (id && user) {
      fetchLook();
    }
  }, [id, user]);

  const fetchLook = async () => {
    try {
      setIsLoading(true);
      const lookData = await getLookById(id);
      
      // Check if user owns this look
      if (lookData.userId !== user.uid) {
        toast({
          title: "Access denied",
          description: "You can only edit your own looks.",
          variant: "destructive",
        });
        router.push(`/social/look/${id}`);
        return;
      }

      setLook(lookData);
      setFormData({
        caption: lookData.caption || '',
        mood: lookData.mood || '',
        tags: lookData.tags || [],
        colorPalette: lookData.colorPalette || [],
        images: lookData.images || []
      });
      setPreviewImages(lookData.images || []);
    } catch (error) {
      console.error('Error fetching look:', error);
      toast({
        title: "Error",
        description: "Failed to load look. Please try again.",
        variant: "destructive",
      });
      router.push('/social/look');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (previewImages.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImages(true);
    const uploadPromises = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
      uploadPromises.push(uploadImageToStorage(file, `looks/${user.uid}/${Date.now()}_${file.name}`));
    }

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setPreviewImages(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "Success",
        description: "Images uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload some images. Please try again.",
        variant: "destructive",
      });
      
      // Clean up preview URLs on error
      newPreviews.forEach(URL.revokeObjectURL);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colorPalette: prev.colorPalette.includes(color)
        ? prev.colorPalette.filter(c => c !== color)
        : prev.colorPalette.length < 6
          ? [...prev.colorPalette, color]
          : prev.colorPalette
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caption.trim() || formData.images.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add a caption and at least one image.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLook(id, user.uid, {
        ...formData,
        caption: formData.caption.trim(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Look updated successfully!",
      });
      
      router.push(`/social/look/${id}`);
    } catch (error) {
      console.error('Error updating look:', error);
      toast({
        title: "Update failed",
        description: "Failed to update look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2.5rem'
        }}>
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!look) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'  
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>Look not found</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>The look you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/social/look')} style={{ color: 'white', backgroundColor: '#0070f3', padding: '0.5rem 1.5rem', borderRadius: '5px' }}>Browse Looks</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '6rem 1rem 2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(103, 126, 234, 0.5); }
          50% { box-shadow: 0 0 40px rgba(103, 126, 234, 0.8); }
        }
      `}</style>
      
      <div style={{
maxWidth: '700px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: 'none',
        padding: '2rem',
        margin: 'auto',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
          borderRadius: '20px 20px 0 0'
        }} />
        
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              color: '#667eea',
              border: '1px solid rgba(103, 126, 234, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(103, 126, 234, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(103, 126, 234, 0.25)';
              e.target.style.background = 'linear-gradient(135deg, rgba(103, 126, 234, 0.15), rgba(118, 75, 162, 0.15))';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(103, 126, 234, 0.15)';
              e.target.style.background = 'linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1))';
            }}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          
          <div style={{ paddingTop: '1rem' }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#1a202c',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.025em',
              lineHeight: '1.1'
            }}>Edit Look</h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              fontWeight: '500',
              marginTop: '0.75rem',
              maxWidth: '600px',
              margin: '0.75rem auto 0'
            }}>Transform your style story with updated details and fresh inspiration</p>
            
            {/* Decorative line */}
            <div style={{
              width: '80px',
              height: '3px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '2px',
              margin: '1.5rem auto 0'
            }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Images */}
          <div style={{ marginBottom: '0' }}>
            <label style={{
              display: 'block',
              fontSize: '18px',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '12px',
              letterSpacing: '0.5px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Images</label>
            <p style={{
              fontSize: '15px',
              color: '#718096',
              marginBottom: '20px',
              fontStyle: 'italic'
            }}>Select up to 3 images to showcase your look</p>
            
            {formData.images.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {formData.images.map((image, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={image}
                      alt={`Look ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        console.error('Failed to load image:', image);
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.display = 'flex';
                        e.target.style.alignItems = 'center';
                        e.target.style.justifyContent = 'center';
                        e.target.alt = 'Failed to load image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formData.images.length < 5 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploadingImages}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isUploadingImages) {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#eff6ff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
              />
            )}
            {isUploadingImages && (
              <p style={{
                fontSize: '14px',
                color: '#3b82f6',
                fontWeight: '500',
                textAlign: 'center',
                padding: '8px'
              }}>Uploading images...</p>
            )}
          </div>

          {/* Caption */}
          <div style={{ marginBottom: '0' }}>
            <label htmlFor="caption" style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>Caption</label>
            <textarea
              id="caption"
              placeholder="Tell us about your look..."
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              required
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#1f2937',
                backgroundColor: 'white',
                resize: 'vertical',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Mood */}
          <div style={{ marginBottom: '0' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>Mood</label>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>What's the vibe of this look?</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '8px'
            }}>
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood }))}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: formData.mood === mood ? '#3b82f6' : '#d1d5db',
                    backgroundColor: formData.mood === mood ? '#3b82f6' : 'white',
                    color: formData.mood === mood ? 'white' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.mood !== mood) {
                      e.target.style.borderColor = '#60a5fa';
                      e.target.style.backgroundColor = '#eff6ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.mood !== mood) {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '0' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>Tags</label>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>Add up to 10 tags (e.g., casual, summer, denim)</p>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
                style={{
                  flex: '1',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#1f2937',
                  backgroundColor: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={addTag}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#eff6ff';
                  e.target.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#374151';
                }}
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map((tag) => (
                  <span 
                    key={tag}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderRadius: '20px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '4px',
                        padding: '2px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div style={{ marginBottom: '0' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>Color Palette</label>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>Select up to 6 colors that represent your look</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))',
              gap: '8px',
              maxWidth: '400px'
            }}>
              {colorPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '4px solid',
                    borderColor: formData.colorPalette.includes(color) ? '#3b82f6' : '#d1d5db',
                    backgroundColor: color,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: formData.colorPalette.includes(color) ? 'scale(1.1)' : 'scale(1)'
                  }}
                  title={color}
                  onMouseEnter={(e) => {
                    if (!formData.colorPalette.includes(color)) {
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.colorPalette.includes(color)) {
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                />
              ))}
            </div>
            
            {formData.colorPalette.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>Selected colors:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {formData.colorPalette.map((color) => (
                    <div
                      key={color}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '2px solid #d1d5db',
                        backgroundColor: color
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{
            display: 'flex',
            gap: '16px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex: '1',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#9ca3af';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImages}
              style={{
                flex: '1',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                background: isSubmitting || isUploadingImages 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                cursor: isSubmitting || isUploadingImages ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(103, 126, 234, 0.3)',
                opacity: isSubmitting || isUploadingImages ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !isUploadingImages) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(103, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !isUploadingImages) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(103, 126, 234, 0.3)';
                }
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Look'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
