'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile } from '@/lib/firebase'

const AuthContext = createContext({})

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
      setProfileLoading(false)
    }

    if (isAuthenticated) {
      fetchUserProfile()
    } else {
      setProfileLoading(false)
    }
  }, [user, isAuthenticated])

  const value = {
    user,
    userProfile,
    loading: authLoading || profileLoading,
    isAuthenticated,
    isEmailVerified: user?.emailVerified || false,
    isMerchant: userProfile?.role === 'merchant' || userProfile?.role === 'admin'
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
