'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UploadForm from '@/components/fashiontv/UploadForm';

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-[100px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-[100px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to upload videos.</p>
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

  const handleSuccess = () => {
    router.push('/fashiontv');
  };

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-auto">
      {/* Top Right Back Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => router.push('/fashiontv')}
          className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 mt-16">
          <h1 className="text-3xl font-bold text-gray-900">Upload Your Video</h1>
          <p className="text-gray-600 mt-2">
            Share your fashion content with the community
          </p>
        </div>
        
        <UploadForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
