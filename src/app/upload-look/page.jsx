'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LookForm from '@/components/look/LookForm';
import { createLook } from '@/lib/look';
import { toast } from '@/hooks/use-toast';

export default function UploadLookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ marginTop: '100px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ marginTop: '100px' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to upload looks.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (lookData) => {
    setIsSubmitting(true);
    try {
      await createLook(user.uid, lookData);
      toast({
        title: "Success!",
        description: "Your look has been uploaded successfully.",
      });
      router.push('/look');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/look');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8" style={{ marginTop: '100px' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Your Look</h1>
          <p className="text-gray-600 mt-2">
            Share your style with the fashion community
          </p>
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
