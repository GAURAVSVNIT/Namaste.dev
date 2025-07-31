'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserByUsername, getUserSocialData } from '@/lib/social';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username;
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // First get the basic user data by username
        const userData = await getUserByUsername(username);
        if (userData) {
          // Then get the complete social data including looks and reels
          const socialData = await getUserSocialData(userData.id);
          // Combine the data
          const completeProfileData = {
            ...userData,
            ...socialData,
            // Ensure we keep the original username from the userData
            username: userData.name || userData.email?.split('@')[0] || 'User'
          };
          setProfileData(completeProfileData);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'rgba(255,255,255,0.9)',
        paddingTop: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'rgba(255,255,255,0.9)',
        paddingTop: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#ef4444'
        }}>
          {error || 'Profile not found'}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  About
                </h3>
                <div style={{
                  fontSize: '16px',
                  color: '#4b5563',
                  lineHeight: '1.6'
                }}>
                  {profileData.bio || 'No bio available'}
                </div>
              </div>
              
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profileData.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#6b7280' }}>📍</span>
                      <span style={{ color: '#4b5563' }}>{profileData.location}</span>
                    </div>
                  )}
                  {profileData.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#6b7280' }}>🔗</span>
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}
                      >
                        {profileData.website}
                      </a>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#6b7280' }}>📅</span>
                    <span style={{ color: '#4b5563' }}>
                      Joined {(() => {
                        try {
                          let dateValue = profileData.joinDate || profileData.createdAt || profileData.created_at;
                          
                          // Handle Firestore Timestamp objects
                          if (dateValue && typeof dateValue.toDate === 'function') {
                            dateValue = dateValue.toDate();
                          }
                          
                          // Handle Firestore Timestamp objects with seconds
                          if (dateValue && dateValue.seconds) {
                            dateValue = new Date(dateValue.seconds * 1000);
                          }
                          
                          // Create Date object and validate
                          const date = new Date(dateValue || Date.now());
                          
                          // Check if date is valid
                          if (isNaN(date.getTime())) {
                            return new Date().toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            });
                          }
                          
                          return date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          });
                        } catch (error) {
                          console.error('Error formatting join date:', error);
                          return new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          });
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Looks</span>
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>
                      {profileData.looks?.length || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Reels</span>
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>
                      {profileData.reels?.length || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Followers</span>
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>
                      {profileData.followersCount || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Following</span>
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>
                      {profileData.followingCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'looks':
        return (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            {profileData.looks && profileData.looks.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {profileData.looks.map((look, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '300px',
                      backgroundImage: `url(${look.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}></div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        {look.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {look.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '16px',
                padding: '48px'
              }}>
                No looks shared yet
              </div>
            )}
          </div>
        );

      case 'reels':
        return (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            {profileData.reels && profileData.reels.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {profileData.reels.map((reel, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    height: '450px'
                  }}>
                    <video 
                      style={{
                        width: '100%',
                        height: '350px',
                        objectFit: 'cover'
                      }}
                      controls
                      poster={reel.thumbnail}
                    >
                      <source src={reel.thumbnail} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div style={{ 
                      padding: '16px',
                      height: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {reel.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {reel.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '16px',
                padding: '48px'
              }}>
                No reels shared yet
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.9)',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Profile Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid rgba(255, 255, 255, 0.5)',
              overflow: 'hidden',
              background: (profileData.photoURL || profileData.avatarSeed) ? 'transparent' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
              {(profileData.photoURL || profileData.avatarSeed) ? (
                <img
                  src={profileData.photoURL || profileData.avatarSeed}
                  alt={profileData.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                fontSize: '48px',
                display: (profileData.photoURL || profileData.avatarSeed) ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}>
                👤
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {profileData.name}
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500',
                marginBottom: '12px'
              }}>
                @{profileData.username}
              </p>
              <div style={{
                display: 'flex',
                gap: '32px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {(profileData.looks?.length || 0) + (profileData.reels?.length || 0)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Posts
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {profileData.followers?.length || 0}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Followers
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {profileData.following?.length || 0}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Following
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Only public tabs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '8px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {['about', 'looks', 'reels'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeTab === tab 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'transparent',
                  color: activeTab === tab ? '#3b82f6' : '#6b7280'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
