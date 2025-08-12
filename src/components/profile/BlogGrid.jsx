'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Calendar, User, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firebase';
import { USER_ROLES } from '@/lib/roles';

export default function BlogGrid({ blogs = [], loading = false, emptyMessage = "No blogs found", onEdit, onDelete, showActions = true }) {
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile to check role
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [currentUser]);

  // Check if user can edit/delete a blog
  const canEditDelete = (blog) => {
    if (!currentUser || !userProfile) return false;
    // Admin can edit/delete any blog, author can edit/delete their own blog
    return userProfile.role === USER_ROLES.ADMIN || currentUser.uid === blog.authorId;
  };
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gap: '32px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        padding: '24px'
      }}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            minHeight: '400px'
          }}>
            <CardHeader style={{ padding: '24px 24px 16px 24px' }}>
              <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '8px', width: '75%', marginBottom: '12px' }}></div>
              <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', width: '50%' }}></div>
            </CardHeader>
            <CardContent style={{ padding: '0 24px 24px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', marginBottom: '8px' }}></div>
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', width: '83%', marginBottom: '8px' }}></div>
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', width: '67%' }}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 24px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          width: '96px',
          height: '96px',
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #374151, #111827)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>No Blogs Yet</h3>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>{emptyMessage}</p>
        <Link href="/blog">
          <Button style={{
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}>Explore Blogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '32px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      padding: '24px'
    }}>
      {blogs.map((blog) => (
        <Card key={blog.id} style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '20px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          minHeight: '400px',
          position: 'relative'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.25)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }}>
          {blog.imageUrl && (
            <div style={{
              aspectRatio: '16 / 9',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={blog.imageUrl} 
                alt={blog.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)'
              }}></div>
            </div>
          )}
          
          <CardHeader style={{
            padding: '28px 28px 20px 28px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <CardTitle style={{
                fontSize: '20px',
                fontWeight: '700',
                lineHeight: '1.3',
                color: '#111827',
                margin: '0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                <Link 
                  href={`/blog/${blog.slug || blog.id}`} 
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'linear-gradient(135deg, #111827, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
                    e.target.style.WebkitBackgroundClip = 'text';
                    e.target.style.WebkitTextFillColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #111827, #374151)';
                    e.target.style.WebkitBackgroundClip = 'text';
                    e.target.style.WebkitTextFillColor = 'transparent';
                  }}
                >
                  {blog.title}
                </Link>
              </CardTitle>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              <Calendar style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              <span>
                {blog.createdAt instanceof Date 
                  ? blog.createdAt.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : new Date(blog.createdAt?.seconds * 1000 || blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                }
              </span>
            </div>
          </CardHeader>
          
          <CardContent style={{
            padding: '0 28px 28px 28px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <p style={{
              color: '#4b5563',
              lineHeight: '1.7',
              marginBottom: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '15px',
              fontWeight: '400',
              flex: 1
            }}>
              {blog.content || blog.description || 'No description available'}
            </p>
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '24px'
              }}>
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {tag}
                  </Badge>
                ))}
                {blog.tags.length > 3 && (
                  <Badge variant="outline" style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}>
                    +{blog.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.3s ease'
                }}>
                  <Heart style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                  <span>{Array.isArray(blog.likes) ? blog.likes.length : 0}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.3s ease'
                }}>
                  <MessageCircle style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                  <span>{Array.isArray(blog.comments) ? blog.comments.length : (blog.commentsCount || 0)}</span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {/* Edit and Delete buttons for admin and blog authors */}
                {showActions && canEditDelete(blog) && (
                  <>
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(blog);
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          color: '#059669',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          fontWeight: '500',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <Edit3 style={{ width: '14px', height: '14px' }} />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this blog?')) {
                            onDelete(blog.id);
                          }
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#dc2626',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          fontWeight: '500',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                        Delete
                      </Button>
                    )}
                  </>
                )}
                
                {/* Share button */}
                <Button size="sm" variant="ghost" style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  fontWeight: '500'
                }} onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.target.style.transform = 'scale(1.05)';
                }} onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}>
                  <Share style={{ width: '16px', height: '16px' }} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
