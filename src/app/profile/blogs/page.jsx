'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/lib/user';
import { getBlogsByAuthor } from '@/lib/blog';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import BlogGrid from '@/components/profile/BlogGrid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProfileBlogsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    loadUserData();
    loadUserBlogs();
  }, [currentUser, authLoading]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(currentUser.uid);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserBlogs = async () => {
    try {
      setBlogsLoading(true);
      const userBlogs = await getBlogsByAuthor(currentUser.uid);
      setBlogs(userBlogs);
      
      // Update user's blog count
      if (user && userBlogs.length !== user.blogCount) {
        await updateUser(currentUser.uid, { blogCount: userBlogs.length });
        setUser(prev => ({ ...prev, blogCount: userBlogs.length }));
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      setBlogs([]);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Blogs</h1>
            <p className="text-muted-foreground">
              {blogs.length} {blogs.length === 1 ? 'blog' : 'blogs'} published
            </p>
          </div>
          
          <Link href="/blog/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Write New Blog
            </Button>
          </Link>
        </div>
        
        {/* Blogs Grid */}
        <BlogGrid 
          blogs={blogs}
          loading={blogsLoading}
          emptyMessage="You haven't written any blogs yet. Start sharing your thoughts with the world!"
        />
      </div>
    </div>
  );
}
