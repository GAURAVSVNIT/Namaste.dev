'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UploadForm from '@/components/fashiontv/UploadForm';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-300 mb-6">You need to be logged in to upload videos.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Login
          </button>
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
