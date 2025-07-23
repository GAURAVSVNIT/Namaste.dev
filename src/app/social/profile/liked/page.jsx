"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { getUserSocialData } from '@/lib/social';
import { Camera, Grid3X3, Heart, MessageCircle, Eye } from 'lucide-react';
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
            background: '#f59e0b',
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
            {profileData?.bio || "Here are the looks and reels you've liked!"}
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
                color: '#f59e0b',
                marginBottom: '8px'
              }}>
                {profileData?.likedContent?.filter(item => item.type === 'Look').length || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Liked Looks
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
                color: '#f59e0b',
                marginBottom: '8px'
              }}>
                {profileData?.likedContent?.filter(item => item.type === 'Reel').length || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Liked Reels
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

const NavigationTabs = ({ activeTab = 'liked' }) => {
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

const LikedPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError('Please log in to view your profile');
      setLoading(false);
      return;
    }

    const fetchLikedData = async () => {
      try {
        setLoading(true);
        const data = await getUserSocialData(currentUser.uid);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching liked data:', error);
        setError('Failed to load liked data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedData();
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
            border: '4px solid #f59e0b',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>Loading your liked items...</p>
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
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
              e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
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

  const likedLooks = profileData?.likedContent?.filter(item => item.type === 'Look') || [];
  const likedReels = profileData?.likedContent?.filter(item => item.type === 'Reel') || [];

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
        <NavigationTabs activeTab="liked" />
        
        {/* Liked Looks */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            Liked Looks
          </h2>
          {likedLooks.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {likedLooks.map((look, index) => (
                <div
                  key={look.id || index}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.3)',
                    height: '350px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-8px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Look Image */}
                  <div style={{
                    position: 'relative',
                    height: '240px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={look.image || "/api/placeholder/300/300"}
                      alt={look.title || "Fashion Look"}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                  
                  {/* Look Info */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {look.title || "Untitled Look"}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.1rem' }}>You haven't liked any looks yet.</p>
          )}
        </div>

        {/* Liked Reels */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            Liked Reels
          </h2>
          {likedReels.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {likedReels.map((reel, index) => (
                <div
                  key={reel.id || index}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.3)',
                    height: '350px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-8px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Reel Video */}
                  <div style={{
                    position: 'relative',
                    height: '240px',
                    overflow: 'hidden'
                  }}>
                    <video
                      controls
                      src={reel.thumbnail || "/api/placeholder/mp4"}
                      alt={reel.title || "Reel Video"}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                  
                  {/* Reel Info */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {reel.title || "Untitled Reel"}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.1rem' }}>You haven't liked any reels yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default LikedPage;

