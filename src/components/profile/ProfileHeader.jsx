'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Edit3, Save, X, LayoutDashboard } from 'lucide-react';
import { uploadAvatar, updateMultiavatar, updateUser } from '@/lib/user';
import { useAuth } from '@/hooks/useAuth';
import AvatarSelector from '@/components/ui/avatar-selector';
import SmartAvatar from '@/components/ui/smart-avatar';
import RoleBadge from '@/components/ui/role-badge';
import RoleSelector from '@/components/ui/role-selector';
import { isAdmin, USER_ROLES } from '@/lib/roles';
import Link from 'next/link';

export default function ProfileHeader({ user, onUpdateProfile }) {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [description, setDescription] = useState(user?.description || '');
  const [uploading, setUploading] = useState(false);
  
  const handleCustomAvatarUpload = async (file) => {
    if (!file || !currentUser) return;
    
    setUploading(true);
    try {
      const photoURL = await uploadAvatar(currentUser.uid, file);
      // Filter out undefined values before updating
      const updates = {};
      if (photoURL !== undefined) updates.photoURL = photoURL;
      updates.avatarSeed = null; // Explicitly set to null to clear any existing seed
      onUpdateProfile(updates);
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
    onUpdateProfile({ name, description });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(user?.name || '');
    setDescription(user?.description || '');
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
    <>
      <style jsx global>{`
        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
      `}</style>
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease'
      }}>
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          alignItems: 'center',
          gap: '32px'
        }}>
          {/* Avatar */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              position: 'relative',
              padding: '6px',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
            }} onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}>
              <SmartAvatar 
                user={user} 
                style={{
                  width: '128px',
                  height: '128px',
                  border: '4px solid white',
                  borderRadius: '50%'
                }}
                fallbackClassName="text-2xl"
              />
              
              {/* Only show avatar selector if viewing own profile */}
              {currentUser?.uid === user.uid && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px'
                }}>
                  <AvatarSelector
                    currentAvatar={user}
                    onAvatarSelect={handleAvatarSelect}
                    onCustomUpload={handleCustomAvatarUpload}
                    trigger={
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        background: uploading ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #10B981, #059669)',
                        color: 'white',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                        border: '3px solid white'
                      }} onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px) scale(1.1)';
                        e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.6)';
                      }} onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px) scale(1)';
                        e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                      }}>
                        {uploading ? (
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '3px solid white',
                            borderTop: '3px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        ) : (
                          <Camera style={{ width: '20px', height: '20px' }} />
                        )}
                      </div>
                    }
                  />
                </div>
              )}
            </div>
            
            {uploading && (
              <div style={{
                fontSize: '12px',
                color: '#F59E0B',
                fontWeight: '500',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                Uploading...
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div style={{
            flex: '1',
            textAlign: window.innerWidth < 768 ? 'center' : 'left',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(255,255,255,0.5)',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                if (currentUser?.uid === user.uid) {
                  e.target.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.target.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                }
              }} onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.5)';
                e.target.style.border = '1px solid rgba(255,255,255,0.3)';
              }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0',
                  background: 'linear-gradient(135deg, #374151, #111827)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {user.name || user.email}
                </h1>
                {currentUser?.uid === user.uid && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }} onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px) scale(1.05)';
                      e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.6)';
                    }} onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px) scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }}>
                    <Edit3 style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            </div>
            
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>{user.email}</p>
            
            <p style={{
              fontSize: '14px',
              color: '#4B5563',
              margin: '0 0 24px 0',
              fontStyle: 'italic',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              {user.description || 'A brief description about yourself. Click edit to add one.'}
            </p>
            
{/* Role Display */}
            div style={{ marginBottom: '24px', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}
              {user.role === USER_ROLES.ADMIN ? (
                Link href="/admin-dashboard" passHref
                  a style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }} onMouseEnter={(e) = e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)'; }} onMouseLeave={(e) = e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'; }}
                  a className="flex items-center"
                     < LayoutDashboard className="w-5 h-5" /> 
                    Admin Dashboard
                  /a
                /Link
              ) : (
                p style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: '#E5E7EB',
                  color: '#374151',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
                  Member
                /p
              )}
            /div
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <RoleBadge role={user.role} style={{ padding: '10px 20px' }} />
              {/* Allow role change for own profile */}
              {currentUser?.uid === user.uid && (
                <RoleSelector
                  currentRole={user.role}
                  onRoleSelect={handleRoleUpdate}
                  disabled={uploading}
                  // Exclude admin role unless current user is admin
                  excludeRoles={!isAdmin(currentUser) ? [USER_ROLES.ADMIN] : []}
                  trigger={
                    <button style={{
                      padding: '4px 12px',
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                    }} onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                    }} onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
                    }}>
                      Change
                    </button>
                  }
                />
              )}
            </div>
            
            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '32px',
              justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start',
              flexWrap: 'wrap'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                minWidth: '80px',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.2)';
                e.target.style.background = 'rgba(34, 197, 94, 0.05)';
              }} onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255,255,255,0.5)';
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>{user.blogCount || 0}</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Blogs</div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                minWidth: '80px',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.2)';
                e.target.style.background = 'rgba(239, 68, 68, 0.05)';
              }} onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255,255,255,0.5)';
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>{user.likedBlogs?.length || 0}</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Likes</div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                minWidth: '80px',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.2)';
                e.target.style.background = 'rgba(124, 58, 237, 0.05)';
              }} onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255,255,255,0.5)';
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>{user.activity?.length || 0}</div>
                <div style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Full Screen Edit Profile Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }} onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancel();
          }
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
            padding: '32px',
            borderRadius: '24px',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transform: 'scale(1)',
            animation: 'modalSlideIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: '0',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Edit Profile</h2>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  color: '#6B7280',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.color = '#EF4444';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6B7280';
                }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name"
                  style={{
                    width: '100%',
                    fontSize: '16px',
                    color: '#111827',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }} onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }} onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Bio</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about yourself..."
                  style={{
                    width: '100%',
                    fontSize: '14px',
                    color: '#4B5563',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '100px',
                    transition: 'all 0.2s ease'
                  }} onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }} onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(229, 231, 235, 0.5)'
            }}>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151',
                  border: '2px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                  e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                  e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: name.trim() ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(229, 231, 235, 0.5)',
                  color: name.trim() ? 'white' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: name.trim() ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }} onMouseEnter={(e) => {
                  if (name.trim()) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                  }
                }} onMouseLeave={(e) => {
                  if (name.trim()) {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }
                }}>
                <Save style={{ width: '16px', height: '16px' }} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
