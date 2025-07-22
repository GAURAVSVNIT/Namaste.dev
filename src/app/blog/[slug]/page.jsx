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
      <p 
        key={index} 
        style={{
          marginBottom: '24px',
          color: '#374151',
          lineHeight: '1.8',
          fontSize: 'inherit',
          textAlign: 'justify'
        }}
      >
        {paragraph}
      </p>
    ));
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: '#ffffff',
            fontSize: '1.125rem',
            fontWeight: '500',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Loading your story...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '24px'
          }}>😢</div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            {error}
          </h1>
          <p style={{
            color: '#6b7280',
            marginBottom: '32px',
            fontSize: '1.125rem'
          }}>
            The story you're looking for seems to have wandered off.
          </p>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }}
          >
            ← Discover More Stories
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.6'%3E%3Cpath d='m0 40 40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }}></div>
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Navigation */}
        <div style={{
          marginBottom: '32px',
          paddingTop: '120px',
          marginTop: '20px'
        }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
              e.target.style.transform = 'translateX(-4px)';
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.target.style.transform = 'translateX(0)';
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
            }}
          >
            ← Back to Stories
          </Link>
        </div>

        {/* Main Content Container */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Header Decoration */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '50%'
          }}></div>

          {/* Blog Header */}
          <header style={{
            marginBottom: '40px',
            position: 'relative',
            zIndex: 2
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              {blog.title}
            </h1>
            
            {/* Author and Date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <span style={{
                  fontSize: '1.25rem'
                }}>👤</span>
                <span style={{
                  color: '#4b5563',
                  fontWeight: '600'
                }}>{blog.authorName}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(118, 75, 162, 0.2)'
              }}>
                <span style={{
                  fontSize: '1.25rem'
                }}>📅</span>
                <span style={{
                  color: '#4b5563',
                  fontWeight: '600'
                }}>{formatDate(blog.createdAt)}</span>
              </div>
            </div>
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '32px'
              }}>
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      color: '#1e40af',
                      fontSize: '0.875rem',
                      padding: '6px 16px',
                      borderRadius: '50px',
                      fontWeight: '600',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      boxShadow: '0 2px 8px rgba(30, 64, 175, 0.1)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {blog.imageUrl && (
            <div style={{
              marginBottom: '48px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}>
              <img
                src={blog.imageUrl}
                alt={blog.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              />
            </div>
          )}

          {/* Blog Content */}
          <article style={{
            marginBottom: '40px',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#374151',
              fontFamily: 'Georgia, serif'
            }}>
              {formatContent(blog.content)}
            </div>
          </article>

          {/* Engagement Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            padding: '24px',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Like Button */}
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                color: isLiked ? '#ef4444' : '#6b7280',
                border: `2px solid ${isLiked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = isLiked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                e.target.style.color = '#ef4444';
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)';
                e.target.style.borderColor = isLiked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)';
                e.target.style.color = isLiked ? '#ef4444' : '#6b7280';
                e.target.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>
                {isLiked ? '❤️' : '🤍'}
              </span>
              <span>
                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
              </span>
            </button>

            {/* Publication Info */}
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              textAlign: 'right'
            }}>
              <div>📝 Published {formatDate(blog.createdAt)}</div>
              {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                <div style={{ marginTop: '4px' }}>
                  ✏️ Updated {formatDate(blog.updatedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Login Prompt */}
          {!user && (
            <div style={{
              textAlign: 'center',
              marginTop: '32px',
              padding: '24px',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <p style={{
                color: '#6b7280',
                marginBottom: '16px',
                fontSize: '1rem'
              }}>
                🔐 Want to engage with this story?
              </p>
              <Link
                href="/auth/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                }}
              >
                ✨ Join the Conversation
              </Link>
            </div>
          )}

          {/* Author Actions */}
          {user && user.uid === blog.authorId && (
            <div style={{
              textAlign: 'center',
              marginTop: '32px',
              padding: '24px',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p style={{
                color: '#059669',
                marginBottom: '16px',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                ✍️ This is your story
              </p>
              <button
                onClick={() => {
                  // Store the blog data in localStorage for editing
                  localStorage.setItem('editingBlog', JSON.stringify(blog));
                  // Navigate to blog page with edit parameter
                  router.push('/blog?edit=true');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(52, 211, 153, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 12px 30px rgba(52, 211, 153, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(52, 211, 153, 0.3)';
                }}
              >
                📝 Edit This Story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
