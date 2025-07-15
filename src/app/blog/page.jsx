'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firebase';
import BlogList from '@/components/blog/BlogList';
import BlogForm from '@/components/blog/BlogForm';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { user, loading: authLoading } = useAuth();

  // Fetch user profile when user is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          // Error fetching user profile - continue without profile
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blog');
      if (response.ok) {
        const blogsData = await response.json();
        setBlogs(blogsData);
      } else {
        // Failed to fetch blogs - will show empty state
      }
    } catch (error) {
      // Error fetching blogs - will show empty state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Create blog
  const handleCreateBlog = async (blogData) => {
    if (!user || !userProfile) {
      alert('Please login to create a blog');
      return;
    }

    try {
      const authorName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email;
      
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...blogData,
          authorId: user.uid,
          authorName: authorName
        }),
      });

      if (response.ok) {
        setShowForm(false);
        fetchBlogs(); // Refresh blogs
        alert('Blog created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create blog: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create blog. Please try again.');
    }
  };

  // Update blog
  const handleUpdateBlog = async (blogData) => {
    if (!user || !editingBlog) return;

    try {
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingBlog.id,
          ...blogData,
          authorId: user.uid
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingBlog(null);
        fetchBlogs(); // Refresh blogs
        alert('Blog updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update blog: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to update blog. Please try again.');
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog?id=${blogId}&authorId=${user.uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBlogs(); // Refresh blogs
        alert('Blog deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete blog: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete blog. Please try again.');
    }
  };

  // Edit blog
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBlog(null);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ marginTop: '100px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8" style={{ marginTop: '100px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fashion Blog</h1>
            <p className="text-gray-600 mt-2">
              Discover the latest trends and fashion insights
            </p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Blog
            </button>
          )}
        </div>

        {/* Show form if creating/editing */}
        {showForm && (
          <div className="mb-8">
            <BlogForm
              onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog}
              onCancel={handleCancelForm}
              initialData={editingBlog}
            />
          </div>
        )}

        {/* Blog List */}
        {!showForm && (
          <BlogList
            blogs={blogs}
            onEdit={handleEditBlog}
            onDelete={handleDeleteBlog}
            isLoading={isLoading}
          />
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && !authLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
                Login
              </a>
              {' or '}
              <a href="/auth/signup" className="text-blue-600 hover:text-blue-800">
                Sign up
              </a>
              {' to create your own blog posts!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
