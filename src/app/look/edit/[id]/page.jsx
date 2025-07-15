'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLookById, updateLook } from '@/lib/look';
import LookForm from '@/components/look/LookForm';
import { toast } from '@/hooks/use-toast';

export default function EditLookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [look, setLook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLook = async () => {
      try {
        setIsLoading(true);
        const lookData = await getLookById(id);
        
        // Check if user owns this look
        if (!user || lookData.userId !== user.uid) {
          toast({
            title: "Access Denied",
            description: "You can only edit your own looks.",
            variant: "destructive",
          });
          router.push('/look');
          return;
        }
        
        setLook(lookData);
      } catch (error) {
        console.error('Error fetching look:', error);
        toast({
          title: "Error",
          description: "Failed to load look. Please try again.",
          variant: "destructive",
        });
        router.push('/look');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      fetchLook();
    }
  }, [id, user, loading, router]);

  const handleSubmit = async (lookData) => {
    setIsSubmitting(true);
    try {
      await updateLook(id, user.uid, lookData);
      toast({
        title: "Success!",
        description: "Your look has been updated successfully.",
      });
      router.push('/look');
    } catch (error) {
      console.error('Error updating look:', error);
      toast({
        title: "Error",
        description: "Failed to update look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/look');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to edit looks.</p>
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

  if (!look) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Look Not Found</h1>
          <p className="text-gray-600 mb-4">The look you're trying to edit doesn't exist.</p>
          <button
            onClick={() => router.push('/look')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Looks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Your Look</h1>
          <p className="text-gray-600 mt-2">
            Update your style and share it with the fashion community
          </p>
        </div>
        
        <LookForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          initialData={look}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
