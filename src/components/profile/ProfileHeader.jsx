'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Edit3, Save, X } from 'lucide-react';
import { uploadAvatar, updateMultiavatar, updateUser } from '@/lib/user';
import { useAuth } from '@/hooks/useAuth';
import AvatarSelector from '@/components/ui/avatar-selector';
import SmartAvatar from '@/components/ui/smart-avatar';
import RoleBadge from '@/components/ui/role-badge';
import RoleSelector from '@/components/ui/role-selector';
import { isAdmin, USER_ROLES } from '@/lib/roles';

export default function ProfileHeader({ user, onUpdateProfile }) {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [uploading, setUploading] = useState(false);
  
  const handleCustomAvatarUpload = async (file) => {
    if (!file || !currentUser) return;
    
    setUploading(true);
    try {
      const photoURL = await uploadAvatar(currentUser.uid, file);
      onUpdateProfile({ photoURL, avatarSeed: null });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarSelect = async (avatarData) => {
    if (!currentUser) return;
    
    setUploading(true);
    try {
      await updateMultiavatar(currentUser.uid, avatarData);
      onUpdateProfile({ 
        photoURL: avatarData.dataUrl, 
        avatarSeed: avatarData.seed 
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
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

  const handleRoleUpdate = async (newRole) => {
    if (!currentUser) return;
    
    setUploading(true);
    try {
      await updateUser(currentUser.uid, { role: newRole });
      onUpdateProfile({ role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUploading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <SmartAvatar 
              user={user} 
              className="w-32 h-32" 
              fallbackClassName="text-2xl"
            />
            
            {/* Only show avatar selector if viewing own profile */}
            {currentUser?.uid === user.uid && (
              <div className="absolute bottom-0 right-0">
                <AvatarSelector
                  currentAvatar={user}
                  onAvatarSelect={handleAvatarSelect}
                  onCustomUpload={handleCustomAvatarUpload}
                  trigger={
                    <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </div>
                  }
                />
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
            
            <p className="text-muted-foreground mb-2">{user.email}</p>
            
            {/* Role Display */}
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <RoleBadge role={user.role} />
              {/* Allow role change for own profile */}
              {currentUser?.uid === user.uid && (
                <RoleSelector
                  currentRole={user.role}
                  onRoleSelect={handleRoleUpdate}
                  disabled={uploading}
                  // Exclude admin role unless current user is admin
                  excludeRoles={!isAdmin(currentUser) ? [USER_ROLES.ADMIN] : []}
                  trigger={
                    <Button variant="ghost" size="sm" className="text-xs">
                      Change
                    </Button>
                  }
                />
              )}
            </div>
            
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
