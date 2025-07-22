'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isValidRole, USER_ROLES } from '@/lib/roles';

/**
 * Custom hook for role-based access control
 * @returns {Object} User role information and helper functions
 */
export const useRole = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      setError(null);
      
      if (!authUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile from Firestore to get role
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        
        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        const role = userData.role || USER_ROLES.MEMBER;

        // Validate role
        if (!isValidRole(role)) {
          throw new Error(`Invalid user role: ${role}`);
        }

        setUser({ ...authUser, ...userData });
        setUserRole(role);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err.message);
        setUser(authUser);
        setUserRole(USER_ROLES.MEMBER); // Default to member on error
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper functions
  const hasRole = (requiredRole) => {
    return userRole === requiredRole;
  };

  const hasAnyRole = (allowedRoles = []) => {
    if (!Array.isArray(allowedRoles)) {
      return false;
    }
    return allowedRoles.includes(userRole);
  };

  const isMember = () => hasRole(USER_ROLES.MEMBER);
  const isAdmin = () => hasRole(USER_ROLES.ADMIN);
  const isMerchant = () => hasRole(USER_ROLES.MERCHANT);

  // Check if user can access merchant features
  const canAccessMerchant = () => {
    return hasAnyRole([USER_ROLES.MERCHANT, USER_ROLES.ADMIN]);
  };

  // Check if user can access admin features
  const canAccessAdmin = () => {
    return hasRole(USER_ROLES.ADMIN);
  };

  return {
    // User data
    user,
    userRole,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Role checking functions
    hasRole,
    hasAnyRole,
    isMember,
    isAdmin,
    isMerchant,
    canAccessMerchant,
    canAccessAdmin,
  };
};
