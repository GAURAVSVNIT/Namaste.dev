'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { uploadVideo } from '@/lib/fashiontv';
import { 
  generateVideoThumbnail, 
  validateVideoFile, 
  createThumbnailPreviewURL, 
  cleanupPreviewURL 
} from '@/utils/videoUtils';
import UploadForm from '@/components/fashiontv/UploadForm';
import Link from 'next/link';
import { Home, ArrowLeft, Upload, Play, Image, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FashionTVUploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(to right, #dc2626, #991b1b)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Play style={{ width: '40px', height: '40px', color: 'white' }} />
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
          }}>You need to be logged in to upload videos to Fashion TV.</p>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => router.push('/auth/login')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #dc2626, #991b1b)',
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

  const handleSuccess = () => {
    router.push('/social/fashiontv');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/social/fashiontv">
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#f3f4f6';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'white';
            e.target.style.transform = 'scale(1)';
          }}>
            <ArrowLeft className="w-6 h-6" />
            <span>Back to Fashion TV</span>
          </button>
        </Link>
        
        <Link href="/social">
          <button style={{
            color: 'white',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#f3f4f6';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'white';
            e.target.style.transform = 'scale(1)';
          }}>
            <Home className="w-6 h-6" />
          </button>
        </Link>
      </div>

      {/* Upload Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <UploadForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
