'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isValidRole } from '@/lib/roles';

/**
 * RoleProtected component - Wrapper for protecting routes based on user roles
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the component
 * @param {React.ReactNode} children - Components to render if user has access
 * @param {React.ReactNode} fallback - Component to render while loading or if no access
 * @param {string} redirectTo - Path to redirect to if user doesn't have access (optional)
 */
const RoleProtected = ({ 
  allowedRoles = [], 
  children, 
  fallback = null, 
  redirectTo = '/auth/login'
}) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setHasAccess(false);
        setLoading(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
        return;
      }

      try {
        // Fetch user profile from Firestore to get role
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        
        if (!userDoc.exists()) {
          console.error('User profile not found');
          setHasAccess(false);
          setLoading(false);
          if (redirectTo) {
            router.push(redirectTo);
          }
          return;
        }

        const userData = userDoc.data();
        const userRole = userData.role;

        // Validate user role
        if (!isValidRole(userRole)) {
          console.error('Invalid user role:', userRole);
          setHasAccess(false);
          setLoading(false);
          if (redirectTo) {
            router.push(redirectTo);
          }
          return;
        }

        // Check if user's role is in allowed roles
        const access = allowedRoles.length === 0 || allowedRoles.includes(userRole);
        
        setUser({ ...authUser, role: userRole });
        setHasAccess(access);
        setLoading(false);

        // Redirect if no access
        if (!access && redirectTo) {
          router.push('/unauthorized');
        }

      } catch (error) {
        console.error('Error checking user role:', error);
        setHasAccess(false);
        setLoading(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    });

    return () => unsubscribe();
  }, [allowedRoles, redirectTo, router]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show children if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or nothing if no access
  return fallback || (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default RoleProtected;
