'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Shuffle, Upload, X } from 'lucide-react';
import { generateRandomMultiavatar } from '@/lib/multiavatar';

export default function AvatarSelector({ 
  currentAvatar, 
  onAvatarSelect, 
  onCustomUpload,
  className = "w-32 h-32",
  trigger
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleGenerateRandomAvatar = () => {
    setIsGenerating(true);
    // Generate one random avatar and apply it
    const randomAvatar = generateRandomMultiavatar();
    setSelectedAvatar(randomAvatar);
    setIsGenerating(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleCustomUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file && uploadPreview) {
      onCustomUpload(file);
      setIsOpen(false);
      setUploadPreview(null);
    }
  };

  const handleSaveSelection = () => {
    onAvatarSelect(selectedAvatar);
    setIsOpen(false);
  };

  const handleDialogOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setSelectedAvatar(currentAvatar);
      setUploadPreview(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Change Avatar
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent style={{
        maxWidth: '560px',
        width: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        margin: '2vh auto'
      }}>
        <DialogHeader style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <DialogTitle style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#111827',
            background: 'linear-gradient(135deg, #374151, #111827)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Current Selection Preview */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '12px' }}>
              <Avatar style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}>
                {uploadPreview ? (
                  <AvatarImage src={uploadPreview} alt="Upload preview" />
                ) : selectedAvatar ? (
                  <AvatarImage src={selectedAvatar.dataUrl || selectedAvatar.photoURL || selectedAvatar} alt="Selected avatar" />
                ) : (
                  <AvatarFallback style={{
                    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    color: '#6b7280',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>?</AvatarFallback>
                )}
              </Avatar>
            </div>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {uploadPreview ? 'Custom Upload Preview' : 'Current Selection'}
            </p>
          </div>

          {/* Upload Custom Image */}
          <Card style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <CardContent style={{ padding: '20px' }}>
              <div style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0'
                }}>Upload Custom Image</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Select Image
                  </Button>
                  
                  {uploadPreview && (
                    <>
                      <Button onClick={handleCustomUpload} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                      }}>
                        Save Custom Image
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadPreview(null);
                          fileInputRef.current.value = '';
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                          border: '2px solid #fecaca',
                          borderRadius: '12px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #fef2f2, #fee2e2)';
                          e.target.style.color = '#dc2626';
                          e.target.style.transform = 'translateY(0px)';
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Random Avatar Generator */}
          <Card style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <CardContent style={{ padding: '20px' }}>
              <div style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0'
                }}>Random Avatar</h3>
                
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0',
                  lineHeight: '1.5'
                }}>Click the button below to generate and apply a new random avatar. You can click as many times as you want!</p>
                
                <Button
                  onClick={handleGenerateRandomAvatar}
                  disabled={isGenerating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px 28px',
                    background: isGenerating 
                      ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' 
                      : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: 'none',
                    borderRadius: '12px',
                    color: isGenerating ? '#9ca3af' : 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isGenerating 
                      ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
                      : '0 8px 25px rgba(79, 70, 229, 0.3)',
                    opacity: isGenerating ? 0.6 : 1,
                    margin: '0 auto',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating) {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 35px rgba(79, 70, 229, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGenerating) {
                      e.target.style.transform = 'translateY(0px) scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.3)';
                    }
                  }}
                >
                  <Shuffle className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Get Random Avatar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!uploadPreview && (
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSelection} 
                disabled={!selectedAvatar}
                style={{
                  padding: '10px 20px',
                  background: !selectedAvatar 
                    ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '12px',
                  color: !selectedAvatar ? '#9ca3af' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !selectedAvatar ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: !selectedAvatar 
                    ? '0 4px 12px rgba(0, 0, 0, 0.05)'
                    : '0 8px 25px rgba(59, 130, 246, 0.3)',
                  opacity: !selectedAvatar ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (selectedAvatar) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAvatar) {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                Save Selection
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
