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
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '20px',
      transition: 'all 0.3s ease',
      border: '1px solid #f3f4f6',
      width: '100%',
      maxWidth: '350px',
      minHeight: '520px',
      height: '520px',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      {/* Blog Image - Fixed height for consistency */}
      <div style={{
        marginBottom: '16px',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '180px',
        backgroundColor: blog.imageUrl ? 'transparent' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {blog.imageUrl ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
        ) : (
          <div style={{
            color: '#9ca3af',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            📝 No Image
          </div>
        )}
      </div>
      
      {/* Blog Header - Fixed height for consistency */}
      <div style={{ marginBottom: '12px' }}>
        <Link href={`/blog/${blog.slug}`}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#111827',
            cursor: 'pointer',
            marginBottom: '8px',
            lineHeight: '1.3',
            transition: 'color 0.2s ease',
            textDecoration: 'none',
            height: '50px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#3b82f6';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#111827';
          }}>
            {blog.title}
          </h2>
        </Link>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#6b7280',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '6px',
          minHeight: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>By {blog.authorName}</span>
            {blog.authorRole && <RoleBadge role={blog.authorRole} size="sm" />}
          </div>
          <span style={{ margin: '0 2px' }}>•</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>
      
      {/* Blog Snippet */}
      <p style={{
        color: '#374151',
        marginBottom: '16px',
        lineHeight: '1.6',
        fontSize: '0.9rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {blog.snippet}
      </p>
      
      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '500',
                border: '1px solid #bfdbfe'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem',
              color: isLiked ? '#ef4444' : '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#ef4444';
              e.target.style.backgroundColor = '#fef2f2';
            }}
            onMouseOut={(e) => {
              e.target.style.color = isLiked ? '#ef4444' : '#6b7280';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likesCount}</span>
          </button>
          
          <Link
            href={`/blog/${blog.slug}`}
            style={{
              color: '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: '500',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#1d4ed8';
              e.target.style.backgroundColor = '#eff6ff';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#3b82f6';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Read More
          </Link>
        </div>
        
        {canEditDelete && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => onEdit(blog)}
              style={{
                color: '#059669',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#047857';
                e.target.style.backgroundColor = '#ecfdf5';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#059669';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(blog.id)}
              style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#b91c1c';
                e.target.style.backgroundColor = '#fef2f2';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#dc2626';
                e.target.style.backgroundColor = 'transparent';
              }}
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
