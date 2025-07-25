"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { getUserSocialData, updateSocialProfile } from '@/lib/social';
import { Camera, Grid3X3, Heart, MessageCircle, Eye, User, Calendar, MapPin, Link2, Mail, Phone, Globe, Users, Star, Award, Activity as ActivityIcon } from 'lucide-react';
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
            {profileData?.bio || "Learn more about this user"}
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

const NavigationTabs = ({ activeTab = 'about' }) => {
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
      gap: '8px',
      marginBottom: '32px',
      background: 'rgba(255,255,255,0.8)',
      padding: '8px',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255,255,255,0.3)'
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

const InfoCard = ({ icon: Icon, title, value, color = '#8b5cf6' }) => {
  if (!value) return null;
  
  return (
    <div style={{
      background: 'rgba(255,255,255,0.8)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.3)',
      transition: 'all 0.3s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-4px)';
      e.target.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.1)';
      e.target.style.background = 'rgba(255,255,255,0.95)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
      e.target.style.background = 'rgba(255,255,255,0.8)';
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '12px'
      }}>
        <div style={{
          padding: '10px',
          background: color,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}40`
        }}>
          <Icon size={20} style={{ color: 'white' }} />
        </div>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0'
        }}>
          {title}
        </h3>
      </div>
      <p style={{
        fontSize: '1rem',
        color: '#4b5563',
        margin: '0',
        lineHeight: '1.5',
        wordBreak: 'break-word'
      }}>
        {value}
      </p>
    </div>
  );
};

const AboutPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

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
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #8b5cf6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>Loading your profile...</p>
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

  // Calculate join date from user creation
  const joinDate = currentUser?.metadata?.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

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
        <NavigationTabs activeTab="about" />
        
        {/* About Content */}
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
              <User size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                About {profileData?.username || 'User'}
              </h2>
              <p style={{
                color: '#6b7280',
                margin: '0',
                fontSize: '0.95rem'
              }}>
                Get to know more about this user
              </p>
            </div>
          </div>

{/* Edit Toggle */}
          <button
            onClick={() => setEditing(!editing)}
            style={{
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
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
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>

          {editing ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateSocialProfile(currentUser.uid, editedData);
                  setProfileData({ ...profileData, ...editedData });
                  setEditing(false);
                } catch (error) {
                  console.error('Error updating profile:', error);
                  setError('Failed to update profile. Please try again.');
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label>
                  Username:
                  <input
                    type="text"
                    value={editedData.username || profileData.username || ''}
                    onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </label>
                <label>
                  Bio:
                  <textarea
                    value={editedData.bio || profileData.bio || ''}
                    onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', resize: 'vertical' }}
                  />
                </label>
                <label>
                  Location:
                  <input
                    type="text"
                    value={editedData.location || profileData.location || ''}
                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </label>
                <label>
                  Website:
                  <input
                    type="text"
                    value={editedData.website || profileData.website || ''}
                    onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    type="text"
                    value={editedData.phone || profileData.phone || ''}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </label>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Bio Section */}
              {profileData?.bio && (
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessageCircle size={20} style={{ color: '#8b5cf6' }} />
                    Bio
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    {profileData.bio}
                  </p>
                </div>
              )}
            </>
          )}

          {/* User Information Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <InfoCard
              icon={Mail}
              title="Email"
              value={currentUser?.email}
              color="#3b82f6"
            />
            
            <InfoCard
              icon={Calendar}
              title="Joined"
              value={joinDate}
              color="#10b981"
            />
            
            <InfoCard
              icon={Users}
              title="User ID"
              value={currentUser?.uid}
              color="#6b7280"
            />
            
            {profileData?.location && (
              <InfoCard
                icon={MapPin}
                title="Location"
                value={profileData.location}
                color="#ef4444"
              />
            )}
            
            {profileData?.website && (
              <InfoCard
                icon={Globe}
                title="Website"
                value={profileData.website}
                color="#8b5cf6"
              />
            )}
            
            {profileData?.phone && (
              <InfoCard
                icon={Phone}
                title="Phone"
                value={profileData.phone}
                color="#f59e0b"
              />
            )}
          </div>

          {/* Statistics Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(118,75,162,0.1))',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Award size={24} style={{ color: '#8b5cf6' }} />
              Profile Statistics
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  {(profileData?.looks?.length || 0)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>
                  Looks Created
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  {(profileData?.reels?.length || 0)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>
                  Reels Created
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  {profileData?.totalLikes || 0}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>
                  Total Likes Received
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  {profileData?.activities?.length || 0}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>
                  Total Activities
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(16,185,129,0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              padding: '12px',
              background: '#10b981',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Account Status: Active
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: '0'
              }}>
                Your account is in good standing and all features are available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
