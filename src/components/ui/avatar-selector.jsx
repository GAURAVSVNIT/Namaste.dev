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
  const [generatedAvatars, setGeneratedAvatars] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const generateRandomAvatars = () => {
    setIsGenerating(true);
    const avatars = [];
    
    // Generate 6 random avatars
    for (let i = 0; i < 6; i++) {
      avatars.push(generateRandomMultiavatar());
    }
    
    setGeneratedAvatars(avatars);
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
      generateRandomAvatars();
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
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Selection Preview */}
          <div className="text-center">
            <div className="mb-4">
              <Avatar className="w-24 h-24 mx-auto">
                {uploadPreview ? (
                  <AvatarImage src={uploadPreview} alt="Upload preview" />
                ) : selectedAvatar ? (
                  <AvatarImage src={selectedAvatar.dataUrl || selectedAvatar.photoURL || selectedAvatar} alt="Selected avatar" />
                ) : (
                  <AvatarFallback>?</AvatarFallback>
                )}
              </Avatar>
            </div>
            <p className="text-sm text-muted-foreground">
              {uploadPreview ? 'Custom Upload Preview' : 'Current Selection'}
            </p>
          </div>

          {/* Upload Custom Image */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Upload Custom Image</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                  
                  {uploadPreview && (
                    <>
                      <Button onClick={handleCustomUpload}>
                        Save Custom Image
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadPreview(null);
                          fileInputRef.current.value = '';
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

          {/* Generated Avatars */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Random Avatars</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomAvatars}
                    disabled={isGenerating}
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate New'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {generatedAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedAvatar?.seed === avatar.seed
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Avatar className="w-16 h-16 mx-auto">
                        <AvatarImage src={avatar.dataUrl} alt={`Generated avatar ${index + 1}`} />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!uploadPreview && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSelection} disabled={!selectedAvatar}>
                Save Selection
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
