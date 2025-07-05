'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBlogBySlug, toggleLike } from '@/lib/blog';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const BlogPost = () => {
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const blogData = await getBlogBySlug(params.slug);
      
      if (!blogData) {
        setError('Blog not found');
        return;
      }
      
      setBlog(blogData);
      setLikesCount(blogData.likes?.length || 0);
      
      if (user && blogData.likes?.includes(user.uid)) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug, user]);

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like blogs');
      return;
    }
    
    if (!blog) return;
    
    try {
      const result = await toggleLike(blog.id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content) => {
    // Simple formatting: convert line breaks to paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← Back to Blogs
          </Link>
        </div>

        {/* Blog Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            <span>By {blog.authorName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(blog.createdAt)}</span>
          </div>
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover Image */}
        {blog.imageUrl && (
          <div className="mb-8">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Blog Content */}
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {formatContent(blog.content)}
          </div>
        </article>

        {/* Blog Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
            
            <div className="text-sm text-gray-500">
              Published on {formatDate(blog.createdAt)}
              {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                <span className="ml-2">
                  • Updated {formatDate(blog.updatedAt)}
                </span>
              )}
            </div>
          </div>
          
          {!user && (
            <div className="mt-4 text-center text-sm text-gray-600">
              <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
                Login
              </a>
              {' to like and interact with blog posts'}
            </div>
          )}
        </div>

        {/* Related Actions for Author */}
        {user && user.uid === blog.authorId && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(`/blog?edit=${blog.id}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-4"
            >
              Edit This Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
