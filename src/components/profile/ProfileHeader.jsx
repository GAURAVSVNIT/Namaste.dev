'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Edit3, Save, X } from 'lucide-react';
import { uploadAvatar } from '@/lib/user';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileHeader({ user, onUpdateProfile }) {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [uploading, setUploading] = useState(false);
  
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    
    setUploading(true);
    try {
      const photoURL = await uploadAvatar(currentUser.uid, file);
      onUpdateProfile({ photoURL });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleSave = () => {
    onUpdateProfile({ name });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(user?.name || '');
    setIsEditing(false);
  };
  
  if (!user) return null;
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user.photoURL} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Only show upload button if viewing own profile */}
            {currentUser?.uid === user.uid && (
              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-2xl font-bold"
                    placeholder="Enter your name"
                  />
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">
                    {user.name || user.email}
                  </h1>
                  {currentUser?.uid === user.uid && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4">{user.email}</p>
            
            {/* Stats */}
            <div className="flex gap-6 justify-center md:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.blogCount || 0}</div>
                <div className="text-sm text-muted-foreground">Blogs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.likedBlogs?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.activity?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
