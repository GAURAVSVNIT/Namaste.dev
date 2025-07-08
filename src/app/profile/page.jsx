'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/lib/user';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, MapPin, Link as LinkIcon } from 'lucide-react';

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
      await updateUser(currentUser.uid, updates);
      setUser(prev => ({ ...prev, ...updates }));
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />
        
        {/* Navigation Tabs */}
        <ProfileTabs />
        
        {/* Profile Overview Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Blogs</span>
                <span className="font-semibold">{user.blogCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Blogs Liked</span>
                <span className="font-semibold">{user.likedBlogs?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Activities</span>
                <span className="font-semibold">{user.activity?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold">
                  {user.created_at 
                    ? new Date(user.created_at?.seconds * 1000 || user.created_at).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {user.activity && user.activity.length > 0 ? (
                <div className="space-y-3">
                  {user.activity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {activity.type === 'liked' && 'Liked a blog'}
                        {activity.type === 'created' && 'Created a blog'}
                        {activity.type === 'updated' && 'Updated a blog'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(activity.timestamp?.seconds * 1000 || activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {user.activity.length > 3 && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={() => router.push('/profile/activity')}
                        className="text-sm text-primary hover:underline"
                      >
                        View all activities
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No recent activity. Start exploring blogs to see your activity here!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {user.created_at 
                      ? new Date(user.created_at?.seconds * 1000 || user.created_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
