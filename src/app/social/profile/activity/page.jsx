"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { getUserSocialData } from '@/lib/social';
import { Camera, Grid3X3, Heart, MessageCircle, Eye, User, Upload, Video, Settings, Play, Link2, Activity as ActivityIcon } from 'lucide-react';
import Link from 'next/link';

const ProfileHeader = ({ profileData }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      marginBottom: '32px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
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
            padding: '4px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <img
              src={profileData?.avatar || "/api/placeholder/150/150"}
              alt={profileData?.username || "User"}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid white'
              }}
            />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            background: '#8b5cf6',
            borderRadius: '50%',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }} />
        </div>

        {/* Profile Info */}
        <div style={{
          flex: 1,
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '12px',
            color: '#1f2937',
            lineHeight: '1.2',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {profileData?.username || "User"}
          </h1>
          
          <p style={{
            color: '#6b7280',
            marginBottom: '24px',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '500px'
          }}>
            {profileData?.bio || "Your recent activity and interactions"}
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
              padding: '20px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#8b5cf6',
                marginBottom: '8px'
              }}>
                {profileData?.activities?.length || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Activities
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#8b5cf6',
                marginBottom: '8px'
              }}>
                {profileData?.totalLikes || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Total Likes
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#8b5cf6',
                marginBottom: '8px'
              }}>
                {(profileData?.looks?.length || 0) + (profileData?.reels?.length || 0)}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Content Created
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavigationTabs = ({ activeTab = 'activity' }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'looks', label: 'Looks', icon: Grid3X3, href: '/social/profile/looks' },
    { id: 'reels', label: 'Reels', icon: Camera, href: '/social/profile/reels' },
    { id: 'liked', label: 'Liked', icon: Heart, href: '/social/profile/liked' },
    { id: 'activity', label: 'Activity', icon: MessageCircle, href: '/social/profile/activity' },
    { id: 'about', label: 'About', icon: Eye, href: '/social/profile/about' }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: isMobile ? '4px' : '8px',
      marginBottom: '32px',
      background: 'rgba(255,255,255,0.8)',
      padding: isMobile ? '6px' : '8px',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255,255,255,0.3)',
      overflowX: 'auto',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      ...(isMobile ? {
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      } : {})
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Link key={tab.id} href={tab.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              background: isActive ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: isActive ? 'white' : '#6b7280',
              boxShadow: isActive ? '0 8px 20px rgba(102, 126, 234, 0.4)' : 'none',
              transform: isActive ? 'translateY(-2px)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
                e.target.style.transform = 'translateY(0)';
              }
            }}>
              <Icon size={16} />
              <span>{tab.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'created':
    case 'post':
      return Upload;
    case 'reel':
      return Video;
    case 'like':
    case 'liked':
      return Heart;
    case 'follow':
      return User;
    case 'profile_update':
      return Settings;
    case 'livestream':
      return Play;
    case 'stream_url':
      return Link2;
    default:
      return ActivityIcon;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'created':
    case 'post':
      return '#10b981';
    case 'reel':
      return '#8b5cf6';
    case 'like':
    case 'liked':
      return '#ef4444';
    case 'follow':
      return '#3b82f6';
    case 'profile_update':
      return '#f59e0b';
    case 'livestream':
      return '#ec4899';
    case 'stream_url':
      return '#06b6d4';
    default:
      return '#6b7280';
  }
};

const formatActivityDescription = (activity) => {
  switch (activity.type) {
    case 'created':
      if (activity.contentType === 'look') {
        return `created a new look "${activity.lookTitle || 'Untitled Look'}"`;
      } else if (activity.contentType === 'reel') {
        return `uploaded a new reel "${activity.reelTitle || 'Untitled Reel'}"`;
      }
      return 'created new content';
    case 'liked':
      if (activity.contentType === 'look') {
        return `liked a look "${activity.lookTitle || 'Untitled Look'}"`;
      } else if (activity.contentType === 'reel') {
        return `liked a reel "${activity.reelTitle || 'Untitled Reel'}"`;
      }
      return 'liked content';
    case 'follow':
      return 'followed a new user';
    case 'profile_update':
      return 'updated your profile';
    case 'livestream':
      return 'started a livestream';
    case 'stream_url':
      return 'added a new stream URL';
    default:
      return activity.description || 'performed an activity';
  }
};

const ActivityPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError('Please log in to view your activity');
      setLoading(false);
      return;
    }

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        const data = await getUserSocialData(currentUser.uid);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setError('Failed to load activity data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [currentUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #8b5cf6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>Loading your activity...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
          </div>
          <h2 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '1.5rem', fontWeight: '700' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activities = profileData?.activities || [];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.9)',
      padding: '40px 20px',
      marginTop: '80px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Profile Header */}
        <ProfileHeader profileData={profileData} />
        
        {/* Navigation Tabs */}
        <NavigationTabs activeTab="activity" />
        
        {/* Activity Timeline */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
            }}>
              <ActivityIcon size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Activity Timeline
              </h2>
              <p style={{
                color: '#6b7280',
                margin: '0',
                fontSize: '0.95rem'
              }}>
                {activities.length} recent activit{activities.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          </div>

          {activities.length > 0 ? (
            <div style={{
              position: 'relative'
            }}>
              {/* Timeline Line */}
              <div style={{
                position: 'absolute',
                left: '24px',
                top: '0',
                bottom: '0',
                width: '2px',
                background: 'linear-gradient(to bottom, #8b5cf6, rgba(139, 92, 246, 0.2))',
                borderRadius: '1px'
              }}></div>

              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                const description = formatActivityDescription(activity);
                const timeAgo = activity.timestamp?.toDate ? 
                  new Date() - activity.timestamp.toDate() :
                  new Date() - new Date(activity.timestamp || 0);
                
                const getTimeString = (ms) => {
                  const minutes = Math.floor(ms / 60000);
                  const hours = Math.floor(minutes / 60);
                  const days = Math.floor(hours / 24);
                  
                  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                  return 'Just now';
                };

                return (
                  <div key={activity.id || index} style={{
                    position: 'relative',
                    paddingLeft: '60px',
                    paddingBottom: index === activities.length - 1 ? '0' : '32px',
                    paddingTop: '8px'
                  }}>
                    {/* Activity Icon */}
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      top: '8px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '3px solid white'
                    }}>
                      <Icon size={16} style={{ color: 'white' }} />
                    </div>

                    {/* Activity Content */}
                    <div style={{
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateX(8px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'rgba(255,255,255,0.95)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(255,255,255,0.8)';
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <p style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0',
                          lineHeight: '1.5'
                        }}>
                          You {description}
                        </p>
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#9ca3af',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          marginLeft: '16px'
                        }}>
                          {getTimeString(timeAgo)}
                        </span>
                      </div>
                      
                      {activity.details && (
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(248,250,252,0.5))',
              borderRadius: '20px',
              border: '2px dashed rgba(139, 92, 246, 0.3)'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)'
              }}>
                <ActivityIcon size={48} style={{ color: 'white' }} />
              </div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                No activity yet
              </h3>
              
              <p style={{
                color: '#6b7280',
                fontSize: '1.1rem',
                margin: '0 0 32px 0',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.6'
              }}>
                Start creating content, liking posts, or updating your profile to see your activity timeline here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
