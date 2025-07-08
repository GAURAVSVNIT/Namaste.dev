'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser, syncUserLikedBlogs } from '@/lib/user';
import { getBlogById } from '@/lib/blog';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import BlogGrid from '@/components/profile/BlogGrid';
import { Heart } from 'lucide-react';

export default function ProfileLikedPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    loadUserDataAndBlogs();
  }, [currentUser, authLoading]);
  
  const loadUserDataAndBlogs = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(currentUser.uid);
      setUser(userData);
      
      // Load liked blogs immediately after getting user data
      await loadLikedBlogsInternal();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadLikedBlogsInternal = async () => {
    try {
      setBlogsLoading(true);
      
      // First sync the user's liked blogs from blog documents
      const syncedLikedBlogIds = await syncUserLikedBlogs(currentUser.uid);
      
      // Update local user state with synced data
      setUser(prev => ({ ...prev, likedBlogs: syncedLikedBlogIds }));
      
      // Load the blog details
      const blogPromises = syncedLikedBlogIds.map(async (blogId) => {
        try {
          const blog = await getBlogById(blogId);
          return blog;
        } catch (error) {
          console.error(`Error loading blog ${blogId}:`, error);
          return null;
        }
      });
      
      const blogs = await Promise.all(blogPromises);
      const validBlogs = blogs.filter(blog => blog !== null);
      
      // Sort by creation date (newest first)
      validBlogs.sort((a, b) => {
        const dateA = a.createdAt instanceof Date 
          ? a.createdAt 
          : new Date(a.createdAt?.seconds * 1000 || a.createdAt);
        const dateB = b.createdAt instanceof Date 
          ? b.createdAt 
          : new Date(b.createdAt?.seconds * 1000 || b.createdAt);
        return dateB - dateA;
      });
      
      setLikedBlogs(validBlogs);
    } catch (error) {
      console.error('Error loading liked blogs:', error);
      setLikedBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };
  
  const handleUpdateProfile = async (updates) => {
    try {
      await updateUser(currentUser.uid, updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Profile Header */}
        {user && (
          <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />
        )}
        
        {/* Navigation Tabs */}
        <ProfileTabs />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold">Liked Blogs</h1>
            <p className="text-muted-foreground">
              {likedBlogs.length} {likedBlogs.length === 1 ? 'blog' : 'blogs'} you've liked
            </p>
          </div>
        </div>
        
        {/* Blogs Grid */}
        <BlogGrid 
          blogs={likedBlogs}
          loading={blogsLoading}
          emptyMessage="You haven't liked any blogs yet. Explore blogs and show some love!"
        />
      </div>
    </div>
  );
}
