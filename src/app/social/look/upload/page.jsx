'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LookForm from '@/components/look/LookForm';
import { createLook } from '@/lib/look';
import { toast } from '@/hooks/use-toast';
import { Camera, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UploadLookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center" style={{ paddingTop: '100px' }}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-pink-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-purple-500 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Upload Studio</h3>
          <p className="text-gray-600">Preparing your creative space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fff1f2, #e8eaf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(to right, #ec407a, #ab47bc)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Camera style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #2c3e50, #34495e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Authentication Required</h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>Join our fashion community to share your amazing looks with style enthusiasts worldwide.</p>
          <div style={{ marginTop: '20px' }}>

            <button
              onClick={() => router.push('/auth/login')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #ec407a, #ab47bc)',
                color: 'white',
                fontWeight: '600',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '10px'
              }}
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => router.push('/social')}
              style={{
                width: '100%',
                color: '#374151',
                fontWeight: '600',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (lookData) => {
  // ✅ Validate required fields
  if (!lookData.title || !lookData.description || !lookData.image) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields before uploading.",
      variant: "destructive",
    });
    return; // Stop submission here
  }

  setIsSubmitting(true);
  try {
    await createLook(user.uid, lookData);
    toast({
      title: "Success!",
      description: "Your look has been uploaded successfully.",
    });
    router.push('/social/look');
  } catch (error) {
    toast({
      title: "Error",
      description: error?.message || "Failed to upload look. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCancel = () => {
    router.push('/social/look');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      paddingTop: '120px', 
      paddingBottom: '120px' 
    }}>
      <div style={{ 
        width: '100%', 
        paddingLeft: '48px', 
        paddingRight: '48px'
      }}>
        {/* Back Button - Top Left */}
        <div style={{ marginBottom: '48px' }}>
          <button
            onClick={() => router.push('/social')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            <span>Back to Feed</span>
          </button>
        </div>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }}>
              <Camera style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
          </div>
          
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            Upload Your Look
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            Share your unique style with the fashion community
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            <span>Create • Inspire • Connect</span>
            <Sparkles style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
          </div>
        </div>
        
        <LookForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
