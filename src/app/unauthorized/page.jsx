'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          You don't have permission to access this page.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          This page is restricted to users with specific roles. Please contact your administrator if you believe this is an error.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </button>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Need help? Contact support or check your account permissions.
          </p>
        </div>
      </div>
    </div>
  );
}
