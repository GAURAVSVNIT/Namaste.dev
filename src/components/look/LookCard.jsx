'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/user';
import { toggleLikeLook } from '@/lib/look';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SmartAvatar from '@/components/ui/smart-avatar';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Function to get gradient based on mood
const getMoodGradient = (mood) => {
  const gradients = {
    'Casual': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Formal': 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    'Sporty': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'Elegant': 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
    'Trendy': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'Vintage': 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
    'Bohemian': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'Classic': 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
    'Edgy': 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    'Romantic': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Minimalist': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'Chill': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  };
  return gradients[mood] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

export default function LookCard({ look, onEdit, onDelete }) {
  const { user } = useAuth();
  const [author, setAuthor] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(look.likes?.length || 0);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Load author information
    const loadAuthor = async () => {
      try {
        const userData = await getUserById(look.userId);
        setAuthor(userData);
      } catch (error) {
        // Error loading author - will show fallback
      }
    };

    loadAuthor();

    // Check if current user liked this look
    if (user && look.likes) {
      setIsLiked(look.likes.includes(user.uid));
    }
  }, [look.userId, look.likes, user]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.uid) {
        try {
          const userData = await getUserById(user.uid);
          setUserRole(userData?.role || null);
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleLike = async () => {
    if (!user) {
      // User must be logged in to like looks
      return;
    }

    setLoading(true);
    try {
      const result = await toggleLikeLook(look.id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      // Error toggling like - could add toast notification here if needed
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user && (user.uid === look.userId || userRole === 'admin');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Main Image */}
        <div className="aspect-square relative overflow-hidden">
          <Link href={`/social/look/${look.id}`}>
            <img
              src={look.images?.[0] || '/placeholder-image.jpg'}
              alt={look.caption}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </Link>
          
          {/* Mood Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px'
          }}>
            <div style={{
              background: getMoodGradient(look.mood),
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}>
              {look.mood}
            </div>
          </div>

          {/* Edit Menu */}
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            
            {/* Edit Menu */}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={{
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 1)';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}>
                    <MoreHorizontal style={{ width: '16px', height: '16px', color: '#374151' }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  minWidth: '160px',
                  backdropFilter: 'blur(20px)'
                }}>
                  <DropdownMenuItem 
                    onClick={() => onEdit(look)} 
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f3f4f6';
                      e.target.style.color = '#1f2937';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#374151';
                    }}>
                    <Edit style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Edit Look
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(look.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#dc2626',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fef2f2';
                      e.target.style.color = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#dc2626';
                    }}>
                    <Trash2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Delete Look
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Author Info */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SmartAvatar 
                user={author} 
                style={{ width: '40px', height: '40px' }}
              />
              <div>
                <p style={{ fontWeight: '600', fontSize: '1rem', color: '#1f2937' }}>{author?.name || 'Unknown User'}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(look.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Caption */}
          <Link href={`/social/look/${look.id}`}>
            <p className="text-sm text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-gray-700">
              {look.caption}
            </p>
          </Link>

          {/* Tags */}
          {look.tags && look.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {look.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  #{tag}
                </Badge>
              ))}
              {look.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{look.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={loading}
                className={`p-0 h-auto ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="ml-1 text-sm">{likesCount}</span>
              </Button>
              
              <Link href={`/social/look/${look.id}`}>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-500 hover:text-gray-700">
                  <MessageCircle className="h-5 w-5" />
                  <span className="ml-1 text-sm">{look.comments?.length || 0}</span>
                </Button>
              </Link>
            </div>

            <Link href={`/social/look/${look.id}`}>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
