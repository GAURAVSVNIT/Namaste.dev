'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toggleLike } from '@/lib/blog';
import RoleBadge from '@/components/ui/role-badge';

const BlogCard = ({ blog, onEdit, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const { user } = useAuth();
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like blogs');
      return;
    }
    
    try {
      const result = await toggleLike(blog.id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const canEditDelete = user && user.uid === blog.authorId;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Blog Image */}
      {blog.imageUrl && (
        <div className="mb-4">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      
      {/* Blog Header */}
      <div className="mb-4">
        <Link href={`/blog/${blog.slug}`}>
          <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
            {blog.title}
          </h2>
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>By {blog.authorName}</span>
            {blog.authorRole && <RoleBadge role={blog.authorRole} size="sm" />}
          </div>
          <span className="mx-1">•</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>
      
      {/* Blog Snippet */}
      <p className="text-gray-700 mb-4 line-clamp-3">
        {blog.snippet}
      </p>
      
      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm ${
              isLiked ? 'text-red-500' : 'text-gray-500'
            } hover:text-red-500`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likesCount}</span>
          </button>
          
          <Link
            href={`/blog/${blog.slug}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Read More
          </Link>
        </div>
        
        {canEditDelete && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(blog)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(blog.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
