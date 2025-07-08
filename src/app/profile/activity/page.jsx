'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/lib/user';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ActivityTimeline from '@/components/profile/ActivityTimeline';
import { Activity } from 'lucide-react';

export default function ProfileActivityPage() {
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
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        {user && (
          <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />
        )}
        
        {/* Navigation Tabs */}
        <ProfileTabs />
        
        {/* Activity Timeline */}
        <ActivityTimeline 
          activities={user?.activity || []}
          loading={loading}
        />
      </div>
    </div>
  );
}
