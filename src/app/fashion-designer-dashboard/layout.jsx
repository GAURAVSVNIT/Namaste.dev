'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

export default function FashionDesignerDashboardLayout({ children }) {
  const [user] = useAuthState(auth);

  return (
    <RoleProtected allowedRoles={[USER_ROLES.FASHION_DESIGNER, USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Fashion Designer Dashboard</h1>
            <div className="flex items-center space-x-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.displayName?.[0] || 'D'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName || 'Designer'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </RoleProtected>
  );
}
