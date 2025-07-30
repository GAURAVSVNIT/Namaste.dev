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
      router.push('auth/login');
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
      <div style={{
        minHeight: '100vh',
        background: 'rgba(248, 250, 252, 0.8)',
        paddingTop: '6rem',
        paddingBottom: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '64rem',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{
              height: '10rem',
              background: 'linear-gradient(90deg, #e2e8f0, #f1f5f9)',
              borderRadius: '12px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <div style={{
              height: '3rem',
              background: 'linear-gradient(90deg, #e2e8f0, #f1f5f9)',
              borderRadius: '12px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  height: '5rem',
                  background: 'linear-gradient(90deg, #e2e8f0, #f1f5f9)',
                  borderRadius: '12px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
              ))}
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(248, 250, 252, 0.8)',
      paddingTop: '6rem',
      paddingBottom: '2rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '64rem'
      }}>
      {/* Main Profile Container with Clean White Glassmorphism */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Profile Header */}
        {user && (
          <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />
        )}
      </div>

      {/* Navigation Tabs Container */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <ProfileTabs />
      </div>

      {/* Activity Section Container */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        padding: '2rem'
      }}>
        {/* Activity Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(229, 231, 235, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'rgba(79, 70, 229, 0.1)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgb(79, 70, 229)'
          }}>
            <Activity size={24} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0',
            color: 'rgb(31, 41, 55)'
          }}>Activity Timeline</h2>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline 
          activities={user?.activity || []}
          loading={loading}
        />
      </div>
      </div>
    </div>
  );
}
