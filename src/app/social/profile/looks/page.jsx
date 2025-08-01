"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUserSocialData } from '@/lib/social';
import { Grid3X3, Heart, MessageCircle, Eye, Camera, Plus, Share2 } from 'lucide-react';
import Link from 'next/link';
import FollowersModal from '@/components/social/FollowersModal';
import { useToast } from '@/hooks/use-toast';
import './hover-effects.css';

const ProfileHeader = ({ profileData, onScrollToLooks }) => {
  const isMobile = useIsMobile();
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const { user } = useAuth();

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
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
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
            background: '#10b981',
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
            {profileData?.bio || "Fashion enthusiast sharing amazing looks"}
          </p>
          
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '20px'
          }}>
            <div 
              onClick={onScrollToLooks}
              style={{
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: hoveredStat === 'looks' ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredStat === 'looks' ? '0 12px 28px rgba(0, 0, 0, 0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredStat('looks')}
              onMouseLeave={() => setHoveredStat(null)}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#ef4444',
                marginBottom: '8px'
              }}>
                {profileData?.looks?.length || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Looks
              </div>
            </div>
            
            <div 
              onClick={() => setIsFollowersModalOpen(true)}
              style={{
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: hoveredStat === 'followers' ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredStat === 'followers' ? '0 12px 28px rgba(0, 0, 0, 0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredStat('followers')}
              onMouseLeave={() => setHoveredStat(null)}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#ef4444',
                marginBottom: '8px'
              }}>
                {profileData?.followers?.length || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Followers
              </div>
            </div>
            
            <div 
              onClick={() => setIsFollowingModalOpen(true)}
              style={{
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: hoveredStat === 'following' ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredStat === 'following' ? '0 12px 28px rgba(0, 0, 0, 0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredStat('following')}
              onMouseLeave={() => setHoveredStat(null)}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#ef4444',
                marginBottom: '8px'
              }}>
                {profileData?.following?.length || 0}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Following
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Followers and Following Modals */}
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        userId={user?.uid}
        type="followers"
      />
      
      <FollowersModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        userId={user?.uid}
        type="following"
      />
    </div>
  );
};

const NavigationTabs = ({ activeTab = 'looks' }) => {
  const isMobile = useIsMobile();
  const [hoveredTab, setHoveredTab] = useState(null);

  const tabs = [
    { id: 'looks', label: 'Looks', icon: Grid3X3, href: '/social/profile/looks' },
    { id: 'reels', label: 'Reels', icon: Camera, href: '/social/profile/reels' },
    { id: 'liked', label: 'Liked', icon: Heart, href: '/social/profile/liked' },
    { id: 'activity', label: 'Activity', icon: MessageCircle, href: '/social/profile/activity' },
    { id: 'about', label: 'About', icon: Eye, href: '/social/profile/about' }
  ];

  return (
    <div 
      className={isMobile ? 'nav-tabs-mobile' : ''}
      style={{
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
        WebkitOverflowScrolling: 'touch'
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
              background: isActive 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : hoveredTab === tab.id 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'transparent',
              color: isActive 
                ? 'white' 
                : hoveredTab === tab.id 
                  ? '#ef4444' 
                  : '#6b7280',
              boxShadow: isActive ? '0 8px 20px rgba(239, 68, 68, 0.4)' : 'none',
              transform: isActive 
                ? 'translateY(-2px)' 
                : hoveredTab === tab.id 
                  ? 'translateY(-1px)' 
                  : 'translateY(0)'
            }}
            onMouseEnter={() => !isActive && setHoveredTab(tab.id)}
            onMouseLeave={() => !isActive && setHoveredTab(null)}>
              <Icon size={16} />
              <span>{tab.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const LooksPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const looksGridRef = useRef(null);
  const { toast } = useToast();

  const handleScrollToLooks = () => {
    if (looksGridRef.current) {
      looksGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      setError('Please log in to view your profile');
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getUserSocialData(currentUser.uid);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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
          <div 
            className="animate-spin"
            style={{
              width: '60px',
              height: '60px',
                border: '4px solid #ef4444',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              margin: '0 auto 20px'
            }}>
          </div>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>Loading your looks...</p>
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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
              e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
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

  const looks = profileData?.looks || [];

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
        <ProfileHeader profileData={profileData} onScrollToLooks={handleScrollToLooks} />
        
        {/* Navigation Tabs */}
        <NavigationTabs activeTab="looks" />
        
        {/* Looks Content */}
        <div 
          ref={looksGridRef}
          style={{
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
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
              }}>
                <Grid3X3 size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  My Looks
                </h2>
                <p style={{
                  color: '#6b7280',
                  margin: '0',
                  fontSize: '0.95rem'
                }}>
                  {looks.length} look{looks.length !== 1 ? 's' : ''} shared
                </p>
              </div>
            </div>
            
            <Link href="/social/look/upload" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: hoveredButton === 'create' 
                  ? '0 12px 28px rgba(239, 68, 68, 0.4)' 
                  : '0 8px 20px rgba(239, 68, 68, 0.3)',
                transform: hoveredButton === 'create' ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onMouseEnter={() => setHoveredButton('create')}
              onMouseLeave={() => setHoveredButton(null)}>
                <Plus size={16} />
                Create Look
              </button>
            </Link>
          </div>

          {/* Looks Grid */}
          {looks.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {looks.map((look, index) => (
                <Link key={look.id || index} href={`/social/look/${look.id}`} style={{ textDecoration: 'none' }}>
                  <div className="look-card">
                  {/* Look Image */}
                  <div style={{
                    position: 'relative',
                    aspectRatio: '1',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={look.image || "/api/placeholder/300/300"}
                      alt={look.title || "Fashion Look"}
                      className="look-image"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="look-overlay" />
                    
                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <button 
                        className="share-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Share functionality
                          if (navigator.share) {
                            navigator.share({
                              title: look.title || 'Fashion Look',
                              text: 'Check out this amazing look!',
                              url: window.location.origin + `/social/look/${look.id}`
                            });
                          } else {
                            // Fallback: copy to clipboard
                            navigator.clipboard.writeText(window.location.origin + `/social/look/${look.id}`)
                              .then(() => {
                                toast({
                                  title: "Success",
                                  description: "Link copied to clipboard!",
                                });
                              })
                              .catch(() => {
                                toast({
                                  title: "Error",
                                  description: "Failed to copy link",
                                  variant: "destructive",
                                });
                              });
                          }
                        }}>
                        <Share2 size={16} style={{ color: '#6b7280' }} />
                      </button>
                    </div>
                  </div>

                  {/* Look Info */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {look.title || "Untitled Look"}
                    </h3>
                    
                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '20px',
                      padding: '12px 0',
                      borderTop: '1px solid rgba(229, 231, 235, 0.5)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                      }}>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle like click - you can implement like functionality here
                            console.log('Like clicked for look:', look.id);
                          }}
                          style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}>
                          <Heart size={18} style={{ color: '#ef4444' }} />
                          <span style={{
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#ef4444'
                          }}>
                            {look.likes || 0}
                          </span>
                        </div>
                        
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle comments click - navigate to look detail page
                            window.open(`/social/look/${look.id}#comments`, '_blank', 'noopener,noreferrer');
                          }}
                          style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}>
                          <MessageCircle size={18} style={{ color: '#3b82f6' }} />
                          <span style={{
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#3b82f6'
                          }}>
                            {look.comments || 0}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(16, 185, 129, 0.15)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}>
                          <Eye size={18} style={{ color: '#10b981' }} />
                          <span style={{
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#10b981'
                          }}>
                            {look.views || 0}
                          </span>
                        </div>
                      </div>
                      
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                        fontWeight: '500'
                      }}>
                        {look.createdAt ? (
                          look.createdAt.toDate ? 
                            look.createdAt.toDate().toLocaleDateString() :
                            new Date(look.createdAt).toLocaleDateString()
                        ) : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
                </Link>
              ))}
            </div>
          ) : (
            // Empty State
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(248,250,252,0.5))',
              borderRadius: '20px',
              border: '2px dashed rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.2)'
              }}>
                <Camera size={48} style={{ color: 'white' }} />
              </div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                No looks yet
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
                Start sharing your amazing fashion looks with the community!
              </p>
              
              <Link href="/social/look/upload" style={{ textDecoration: 'none' }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 12px 28px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 16px 36px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 12px 28px rgba(239, 68, 68, 0.3)';
                }}>
                  <Plus size={20} />
                  Create Your First Look
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LooksPage;
