'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/lib/user';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, MapPin, Link as LinkIcon, Activity, User, ShoppingCart } from 'lucide-react';

// Reusable style objects
const styles = {
  // Container styles
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 16px',
    marginTop: '80px'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  gridLayout: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
  },
  
  // Card styles
  card: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease'
  },
  
  // Header styles
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  iconContainer: {
    padding: '12px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0'
  },
  
  // Content item styles
  contentGrid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  },
  flexColumnGap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  
  // Text styles
  labelText: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827'
  },
  smallText: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0'
  },
  mediumText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  
  // Activity styles
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  activityDot: {
    width: '8px',
    height: '8px',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    borderRadius: '50%',
    flexShrink: 0
  },
  activityText: {
    fontSize: '14px',
    color: '#6B7280',
    flex: 1
  },
  activityDate: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: '500'
  },
  
  // Button styles
  viewAllButton: {
    fontSize: '14px',
    color: '#3B82F6',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500'
  },
  
  // Coming soon placeholder
  placeholder: {
    textAlign: 'center',
    padding: '40px 20px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  placeholderIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
    borderRadius: '50%',
    marginBottom: '16px'
  },
  placeholderTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 8px 0'
  },
  placeholderText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 16px 0'
  },
  comingSoonBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: 'white',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  // Empty state
  emptyState: {
    fontSize: '14px',
    color: '#6B7280',
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)',
    margin: '0'
  }
};

// Gradient configurations for different sections
const gradients = {
  quickStats: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  quickStatsIcon: '0 8px 25px rgba(59, 130, 246, 0.3)',
  activity: 'linear-gradient(135deg, #22C55E, #10B981)',
  activityIcon: '0 8px 25px rgba(34, 197, 94, 0.3)',
  orders: 'linear-gradient(135deg, #A855F7, #EC4899)',
  ordersIcon: '0 8px 25px rgba(168, 85, 247, 0.3)',
  profile: 'linear-gradient(135deg, #EF4444, #DC2626)',
  profileIcon: '0 8px 25px rgba(239, 68, 68, 0.3)',
  totalBlogs: 'linear-gradient(135deg, #059669, #047857)',
  blogsLiked: 'linear-gradient(135deg, #DC2626, #EF4444)',
  totalActivities: 'linear-gradient(135deg, #7C3AED, #A855F7)'
};

// Hover effect handlers
const hoverEffects = {
  onMouseEnter: (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
  },
  onMouseLeave: (e) => {
    e.target.style.transform = 'translateY(0px)';
    e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  }
};

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    loadUserData();
  }, [currentUser, authLoading]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(currentUser.uid);
      
      // Also get the user's blog count
      const { getBlogsByAuthor } = await import('@/lib/blog');
      const userBlogs = await getBlogsByAuthor(currentUser.uid);
      
      // Populate activities if user doesn't have any
      let finalUserData = { ...userData };
      if (!userData.activity || userData.activity.length === 0) {
        try {
          const { populateActivitiesFromExistingData } = await import('@/lib/user');
          const activities = await populateActivitiesFromExistingData(currentUser.uid);
          finalUserData.activity = activities;
        } catch (activityError) {
          console.error('Error populating activities:', activityError);
          finalUserData.activity = [];
        }
      }
      
      // Update user data with current blog count
      finalUserData.blogCount = userBlogs.length;
      
      // Update in Firestore if count has changed
      if (userData.blogCount !== userBlogs.length) {
        await updateUser(currentUser.uid, { blogCount: userBlogs.length });
      }
      
      setUser(finalUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProfile = async (updates) => {
    try {
      // Filter out undefined values to prevent Firebase errors
      const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      if (Object.keys(filteredUpdates).length > 0) {
        await updateUser(currentUser.uid, filteredUpdates);
        setUser(prev => ({ ...prev, ...filteredUpdates }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-muted-foreground">Unable to load your profile data.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.mainContainer}>
      <div style={styles.flexColumn}>
        {/* Profile Header */}
        <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />
        
        {/* Navigation Tabs */}
        <ProfileTabs />
        
        {/* Profile Overview Content */}
        <div style={styles.gridLayout}>
          {/* Quick Stats */}
          <div style={styles.card} {...hoverEffects}>
            <div style={styles.sectionHeader}>
              <div style={{
                ...styles.iconContainer,
                background: gradients.quickStats,
                boxShadow: gradients.quickStatsIcon
              }}>
                <CalendarDays style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={styles.sectionTitle}>Quick Stats</h3>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Total Blogs</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{user.blogCount || 0}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Blogs Liked</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{user.likedBlogs?.length || 0}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Total Activities</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{user.activity?.length || 0}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Member Since</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {user.created_at 
                    ? new Date(user.created_at?.seconds * 1000 || user.created_at).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Summary */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease'
          }} onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }} onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #22C55E, #10B981)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
              }}>
                <Activity style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: '0'
              }}>Recent Activity</h3>
            </div>
            
            {user.activity && user.activity.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {user.activity.slice(0, 3).map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                      borderRadius: '50%',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      flex: 1
                    }}>
                      {activity.type === 'liked' && 'Liked a blog'}
                      {activity.type === 'created' && 'Created a blog'}
                      {activity.type === 'updated' && 'Updated a blog'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      fontWeight: '500'
                    }}>
                      {new Date(activity.timestamp?.seconds * 1000 || activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {user.activity.length > 3 && (
                  <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                    <button 
                      onClick={() => router.push('/profile/activity')}
                      style={{
                        fontSize: '14px',
                        color: '#3B82F6',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '500'
                      }}
                    >
                      View all activities
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                margin: '0'
              }}>
                No recent activity. Start exploring blogs to see your activity here!
              </p>
            )}
          </div>
          
          {/* Orders Section - Placeholder */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease'
          }} onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }} onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
              }}>
                <ShoppingCart style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: '0'
              }}>Order Management</h3>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                borderRadius: '50%',
                marginBottom: '16px'
              }}>
                <ShoppingCart style={{ width: '30px', height: '30px', color: '#6B7280' }} />
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>Order Management</h4>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0 0 16px 0'
              }}>Track and manage your orders</p>
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600'
              }}>Coming Soon</div>
            </div>
          </div>
        </div>
        
        {/* Profile Details */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease'
        }} onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        }} onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0px)';
          e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
            }}>
              <User style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              margin: '0'
            }}>Profile Details</h3>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <CalendarDays style={{ width: '20px', height: '20px', color: '#6B7280' }} />
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>Joined</p>
                <p style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  margin: '0'
                }}>
                  {user.created_at 
                    ? new Date(user.created_at?.seconds * 1000 || user.created_at).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <LinkIcon style={{ width: '20px', height: '20px', color: '#6B7280' }} />
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>Email</p>
                <p style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  margin: '0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}>{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
