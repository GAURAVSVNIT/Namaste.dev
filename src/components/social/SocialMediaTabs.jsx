"use client";
import React, { useState, useEffect } from "react";
import { 
  Grid3X3, 
  Play, 
  Heart, 
  Activity, 
  User, 
  Settings,
  Calendar,
  TrendingUp,
  Eye,
  MessageCircle,
  Share,
  Image,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ActivityTimeline from "@/components/profile/ActivityTimeline";
import { useAuth } from '@/hooks/useAuth';
import { updateSocialProfile } from '@/lib/social';

const SocialMediaTabs = ({ profileData }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    bio: profileData?.bio || '',
    location: profileData?.location || '',
    website: profileData?.website || ''
  });

  // Update form data when profileData changes
  useEffect(() => {
    setEditFormData({
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      website: profileData?.website || ''
    });
  }, [profileData]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateSocialProfile(user.uid, editFormData);
      setIsEditModalOpen(false);
      // Refresh the page to see updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeTab, setActiveTab] = useState("looks");

  // Tab configuration for social media profile
  const socialTabs = [
    {
      value: "looks",
      label: "Looks",
      icon: Grid3X3,
      count: profileData?.looks?.length || 0
    },
    {
      value: "reels", 
      label: "Reels",
      icon: Play,
      count: profileData?.reels?.length || 0
    },
    {
      value: "liked",
      label: "Liked",
      icon: Heart,
      count: profileData?.likedContent?.length || 0
    },
    {
      value: "activity",
      label: "Activity",
      icon: Activity,
      count: profileData?.activities?.length || 0
    },
    {
      value: "about",
      label: "About",
      icon: User,
      count: null
    }
  ];

  const ProfileStats = () => (
    <div 
      style={{
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '40px',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: '32px',
      }}>
        {/* Profile Avatar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            padding: '3px',
            background: '#667eea',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
          }}>
            <img
              src={profileData?.avatar || "/api/placeholder/150/150"}
              alt={profileData?.username || "User"}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white'
              }}
            />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '24px',
            height: '24px',
            background: '#10b981',
            borderRadius: '50%',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }} />
        </div>

        {/* Profile Info */}
        <div style={{
          flex: 1,
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            {profileData?.username || "User"}
          </h1>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px',
            fontSize: '1rem',
            lineHeight: '1.5',
            maxWidth: '500px'
          }}>
            {profileData?.bio || "No bio available"}
          </p>
          
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '20px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#e5e7eb';
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#667eea',
                marginBottom: '4px'
              }}>
                {profileData?.looks?.length || 0}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Looks
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#e5e7eb';
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#667eea',
                marginBottom: '4px'
              }}>
                {profileData?.followers?.length || 0}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Followers
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#e5e7eb';
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#667eea',
                marginBottom: '4px'
              }}>
                {profileData?.following?.length || 0}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Following
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            {profileData?.location && (
              <span style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📍 {profileData.location}
              </span>
            )}
            {profileData?.joinDate && (
              <span style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Calendar className="w-3 h-3" />
                Joined {profileData.joinDate?.seconds 
                  ? new Date(profileData.joinDate.seconds * 1000).toLocaleDateString()
                  : new Date(profileData.joinDate).toLocaleDateString()
                }
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: '12px',
          minWidth: isMobile ? 'auto' : '180px'
        }}>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            style={{
            padding: '12px 20px',
            background: '#667eea',
            color: 'white',
            borderRadius: '10px',
            border: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}>
            <Settings className="w-4 h-4" />
            Edit Profile
          </button>
          <button style={{
            padding: '12px 20px',
            background: 'transparent',
            color: '#6b7280',
            borderRadius: '10px',
            border: '2px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.color = '#667eea';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}>
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );

  const LooksGrid = ({ looks }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {false ? (
        looks.map((look, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-square bg-gray-200 relative">
              {look.image ? (
                <img 
                  src={look.image} 
                  alt={look.title || "Look"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Grid3X3 size={48} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {look.type || "Look"}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate mb-2">{look.title || "Untitled Look"}</h3>
              <div className="flex justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  {look.views || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={16} />
                  {look.likes || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  {look.comments || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <div 
            className="text-center py-16 rounded-3xl" 
            style={{
            background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.03), rgba(107, 114, 128, 0.03))',
            border: '2px dashed rgba(100, 116, 139, 0.12)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="relative mx-auto mb-8" style={{ width: '120px', height: '120px' }}>
              <div 
                className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 rounded-full flex items-center justify-center"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(100, 116, 139, 0.05)'
                }}
              >
                <Grid3X3 size={56} className="text-slate-400" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-3 -right-3 animate-bounce">
                <div className="bg-pink-500 rounded-full w-6 h-6 flex items-center justify-center">
                  <Image size={12} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 animate-pulse">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-full px-3 py-1">
                  <span className="text-white text-xs font-bold">NEW</span>
                </div>
              </div>
            </div>
            
            <h3 
              className="text-2xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #64748b, #6b7280)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              No looks yet
            </h3>
            
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Share your fashion style and inspire others with your unique looks!
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-gradient-to-r from-slate-400 to-gray-500 hover:from-slate-500 hover:to-gray-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2">
                <Plus size={20} />
                Upload Look
              </button>
              <button className="bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2">
                <Eye size={20} />
                Explore Looks
              </button>
            </div>
            
            {/* Tips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                <div className="text-purple-500 mb-2">📸</div>
                <p className="text-sm font-medium text-gray-700">High quality photos</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-pink-100">
                <div className="text-pink-500 mb-2">✨</div>
                <p className="text-sm font-medium text-gray-700">Style details & tags</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-violet-100">
                <div className="text-violet-500 mb-2">💫</div>
                <p className="text-sm font-medium text-gray-700">Inspiring captions</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ReelsGrid = ({ reels }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {reels && reels.length > 0 ? (
        reels.map((reel, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-[9/16] bg-gray-200 relative">
              {reel.thumbnail ? (
                <img 
                  src={reel.thumbnail} 
                  alt={reel.title || reel.caption || "Reel"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if thumbnail fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-100 to-purple-100"
                style={{ display: reel.thumbnail ? 'none' : 'flex' }}
              >
                <Play size={32} className="text-blue-500" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="text-white" size={24} />
              </div>
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {reel.duration ? `${Math.floor(reel.duration / 60)}:${String(Math.floor(reel.duration % 60)).padStart(2, '0')}` : "0:00"}
              </div>
            </div>
            <CardContent className="p-2">
              <p className="text-sm font-medium truncate">{reel.title || reel.caption || "Untitled Reel"}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{reel.views || 0} views</span>
                <span>{reel.likes?.length || 0} ❤️</span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <div 
            className="text-center py-16 rounded-3xl" 
            style={{
            background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.02), rgba(107, 114, 128, 0.02))',
            border: '2px dashed rgba(100, 116, 139, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="relative mx-auto mb-8" style={{ width: '120px', height: '120px' }}>
              <div 
                className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 rounded-full flex items-center justify-center"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(100, 116, 139, 0.05)'
                }}
              >
                <Play size={56} className="text-slate-400 fill-slate-400" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-3 -right-3 animate-bounce">
                <div className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">●</span>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 animate-pulse">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1">
                  <span className="text-white text-xs font-bold">HD</span>
                </div>
              </div>
            </div>
            
            <h3 
              className="text-2xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #64748b, #6b7280)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              No reels yet
            </h3>
            
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Share your moments and creativity with engaging short videos!
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-gradient-to-r from-slate-400 to-gray-500 hover:from-slate-500 hover:to-gray-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2">
                <Plus size={20} />
                Create Reel
              </button>
              <button className="bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2">
                <Eye size={20} />
                Watch Reels
              </button>
            </div>
            
            {/* Tips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                <div className="text-blue-500 mb-2">📱</div>
                <p className="text-sm font-medium text-gray-700">Record vertical videos</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                <div className="text-purple-500 mb-2">⏱️</div>
                <p className="text-sm font-medium text-gray-700">15-60 seconds long</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-pink-100">
                <div className="text-pink-500 mb-2">✨</div>
                <p className="text-sm font-medium text-gray-700">Add trending effects</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const LikedContent = ({ likedContent }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {false ? (
        likedContent.map((item, index) => (
          <Card 
            key={index} 
            className="group overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg"
            style={{
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            {/* Enhanced Thumbnail */}
            <div className="relative overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
              {(item.thumbnail || item.image) ? (
                <img 
                  src={item.thumbnail || item.image} 
                  alt={item.title || "Liked content"}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                  {item.type === 'Look' ? 
                    <Image size={48} className="text-purple-400" /> : 
                    <Play size={48} className="text-pink-400" />
                  }
                </div>
              )}
              
              {/* Enhanced Type Badge */}
              <div className="absolute top-3 left-3">
                <span 
                  className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-md ${
                    item.type === 'Look' 
                      ? 'bg-purple-500/90 text-white' 
                      : 'bg-gradient-to-r from-pink-500/90 to-rose-500/90 text-white'
                  }`}
                >
                  {item.type || "Post"}
                </span>
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Heart Indicator */}
              <div className="absolute top-3 right-3">
                <div className="bg-red-500/90 backdrop-blur-md rounded-full p-2 shadow-lg">
                  <Heart size={16} className="text-white fill-white" />
                </div>
              </div>
            </div>
            
            {/* Enhanced Content */}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {item.title || "Untitled"}
              </h3>
              
              {/* Enhanced Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Eye size={16} />
                    <span className="font-medium">{item.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <Heart size={16} />
                    <span className="font-medium">{item.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <MessageCircle size={16} />
                    <span className="font-medium">{item.comments || 0}</span>
                  </div>
                </div>
                
                {/* Action Button */}
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold transform hover:scale-105 transition-all duration-200 shadow-lg">
                  View
                </button>
              </div>
              
              {/* Enhanced Liked Date */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">
                  Liked {item.likedAt ? (
                    item.likedAt.toDate 
                      ? item.likedAt.toDate().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }) 
                      : new Date(item.likedAt).toLocaleDateString('en-US', {
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                  ) : 'recently'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <div 
            className="text-center py-16 rounded-3xl" 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="relative mx-auto mb-6" style={{ width: '120px', height: '120px' }}>
              <div 
                className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(147, 51, 234, 0.1)'
                }}
              >
                <Heart size={56} className="text-purple-400" />
              </div>
              {/* Floating hearts animation */}
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Heart size={20} className="text-pink-400 fill-pink-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-pulse">
                <Heart size={16} className="text-purple-400 fill-purple-400" />
              </div>
            </div>
            
            <h3 
              className="text-2xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #64748b, #6b7280)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              No liked content yet
            </h3>
            
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Start exploring amazing looks and reels to build your collection of favorites!
            </p>
            
            <div className="flex gap-4 justify-center">
              <button className="bg-gradient-to-r from-slate-400 to-gray-500 hover:from-slate-500 hover:to-gray-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2">
                <Plus size={20} />
                Explore Looks
              </button>
              <button className="bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2">
                <Play size={20} />
                Watch Reels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  const AboutSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Bio</label>
            <p className="text-gray-800">{profileData?.bio || "No bio provided"}</p>
          </div>
          {profileData?.location && (
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p className="text-gray-800">{profileData.location}</p>
            </div>
          )}
          {profileData?.website && (
            <div>
              <label className="text-sm font-medium text-gray-600">Website</label>
              <a 
                href={profileData.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profileData.website}
              </a>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-600">Joined</label>
            <p className="text-gray-800">
              {profileData?.joinDate 
                ? (profileData.joinDate?.seconds 
                    ? new Date(profileData.joinDate.seconds * 1000).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : new Date(profileData.joinDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                  )
                : "Date not available"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{profileData?.looks?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Looks</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{profileData?.totalLikes || 0}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{profileData?.totalViews || 0}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{profileData?.engagementRate || "0%"}</div>
              <div className="text-sm text-gray-600">Engagement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '40px 20px',
        marginTop: '80px'
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Profile Stats Header */}
        <ProfileStats />

        {/* Social Media Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '8px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <TabsList 
              className="grid w-full grid-cols-5"
              style={{
                background: 'transparent',
                border: 'none',
                gap: '4px'
              }}
            >
              {socialTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    style={{
                      background: activeTab === tab.value 
                        ? '#667eea'
                        : 'transparent',
                      color: activeTab === tab.value ? 'white' : '#6b7280',
                      border: activeTab === tab.value ? 'none' : '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      transition: 'all 0.2s ease',
                      fontWeight: '600',
                      boxShadow: activeTab === tab.value 
                        ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                        : 'none',
                      transform: activeTab === tab.value 
                        ? 'translateY(-1px)' 
                        : 'translateY(0)'
                    }}
                    className="flex items-center gap-2 hover:bg-opacity-90"
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.value) {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.value) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }
                    }}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count !== null && (
                      <Badge 
                        variant="secondary" 
                        style={{
                          background: activeTab === tab.value ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb',
                          color: activeTab === tab.value ? 'white' : '#6b7280',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginLeft: '4px',
                          padding: '2px 6px',
                          borderRadius: '6px'
                        }}
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <TabsContent value="looks" className="mt-0">
              <LooksGrid looks={profileData?.looks} />
            </TabsContent>

            <TabsContent value="reels" className="mt-0">
              <ReelsGrid reels={profileData?.reels} />
            </TabsContent>

            <TabsContent value="liked" className="mt-0">
              <LikedContent likedContent={profileData?.likedContent} />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityTimeline activities={profileData?.activities} />
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <AboutSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#1f2937'
            }}>Edit Profile</h2>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Bio</label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Location</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Where are you based?"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Website</label>
                <input
                  type="url"
                  value={editFormData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isUpdating ? '#9ca3af' : '#667eea',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) {
                      e.target.style.backgroundColor = '#5a67d8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpdating) {
                      e.target.style.backgroundColor = '#667eea';
                    }
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTabs;
