'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getLookById, toggleLikeLook, addCommentToLook, deleteCommentFromLook } from '@/lib/look';
import { getUserProfile } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SmartAvatar from '@/components/ui/smart-avatar';
import { toast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  Bookmark,
  Eye,
  Calendar,
  Palette,
  Tag,
  User,
  Clock
} from 'lucide-react';

export default function LookDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();
  const router = useRouter();
  const [look, setLook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLook();
    }
  }, [id]);

  const fetchLook = async () => {
    try {
      setIsLoading(true);
      const lookData = await getLookById(id);
      setLook(lookData);
      setLikesCount(lookData.likes?.length || 0);
      setComments(lookData.comments || []);
      
      // Check if current user liked this look
      if (user && lookData.likes) {
        setIsLiked(lookData.likes.includes(user.uid));
      }

      // Load author information
      const authorData = await getUserProfile(lookData.userId);
      setAuthor(authorData);
    } catch (error) {
      console.error('Error fetching look:', error);
      toast({
        title: "Error",
        description: "Failed to load look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to like looks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await toggleLikeLook(id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!commentInput.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    try {
      const newComment = await addCommentToLook(id, user.uid, commentInput.trim());
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      await deleteCommentFromLook(id, user.uid, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: look.caption,
          text: `Check out this look: ${look.caption}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        paddingTop: '100px',
        paddingBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            height: '2rem',
            width: '8rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            animation: 'pulse 2s infinite'
          }}></div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              aspectRatio: '1',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'pulse 2s infinite'
            }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                height: '1.5rem',
                width: '75%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{
                height: '1rem',
                width: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{
                height: '5rem',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{
                height: '2.5rem',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!look) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937',
            textAlign: 'center'
          }}>Look not found</h1>
          <p style={{
            color: '#6b7280',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>The look you're looking for doesn't exist.</p>
      <Link href="/social/look">
        <Button style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>Browse Looks</Button>
      </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)',
        paddingTop: '100px',
        paddingBottom: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }}></div>
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Enhanced Back Button */}
        <div style={{
          marginBottom: '40px',
          opacity: 1,
          animation: 'slideDown 0.6s ease-out'
        }}>
          <Link href="/social/look" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              padding: '18px 28px',
              background: 'rgba(255, 255, 255, 0.98)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              color: '#4c1d95',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 20px 40px rgba(103, 126, 234, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)';
              e.target.style.boxShadow = '0 30px 60px rgba(103, 126, 234, 0.25), 0 15px 30px rgba(0, 0, 0, 0.15)';
              e.target.style.background = 'rgba(255, 255, 255, 1)';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 20px 40px rgba(103, 126, 234, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)';
              e.target.style.background = 'rgba(255, 255, 255, 0.98)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}>
              <ArrowLeft style={{
                width: '22px',
                height: '22px',
                color: '#8b5cf6',
                filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))'
              }} />
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 4px rgba(103, 126, 234, 0.2)'
              }}>← Back to Looks</span>
            </button>
          </Link>
        </div>

        {/* Premium Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '50px',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          {/* Main Content Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '32px',
            padding: '0',
            boxShadow: '0 40px 80px rgba(103, 126, 234, 0.15), 0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(40px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            position: 'relative',
            transform: 'translateY(0)',
            transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 50px 100px rgba(103, 126, 234, 0.2), 0 30px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 40px 80px rgba(103, 126, 234, 0.15), 0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1fr)'
            }}>
              {/* Left Side - Images */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                minHeight: '700px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Main Image Display */}
                <div style={{
                  position: 'relative',
                  flex: 1,
                  minHeight: '550px',
                  overflow: 'hidden',
                  borderRadius: '0',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)'
                }}>
                  <img
                    src={look.images[currentImageIndex]}
                    alt={look.caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      filter: 'brightness(1) contrast(1.05) saturate(1.1)',
                      borderRadius: '0'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.filter = 'brightness(1.1) contrast(1.1) saturate(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.filter = 'brightness(1) contrast(1.05) saturate(1.1)';
                    }}
                  />
                  

                  {/* Image Navigation Dots */}
                  {look.images.length > 1 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '12px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {look.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: 'none',
                            background: index === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: index === currentImageIndex ? 'scale(1.2)' : 'scale(1)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {look.images.length > 1 && (
                  <div style={{
                    padding: '20px',
                    background: 'rgba(248, 250, 252, 0.8)',
                    borderTop: '1px solid rgba(226, 232, 240, 0.5)'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      overflowX: 'auto',
                      paddingBottom: '4px'
                    }}>
                      {look.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{
                            flexShrink: 0,
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: index === currentImageIndex 
                              ? '3px solid #6366f1' 
                              : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: index === currentImageIndex ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: index === currentImageIndex 
                              ? '0 8px 25px rgba(99, 102, 241, 0.3)' 
                              : '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Details */}
              <div style={{
                padding: '32px',
                background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0.9))',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {/* Author & Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.5)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <SmartAvatar 
                      user={author} 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '2px solid rgba(103, 126, 234, 0.2)'
                      }}
                    />
                    <div>
                      <h3 style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>{author?.first_name && author?.last_name ? `${author.first_name} ${author.last_name}` : author?.email || 'Unknown User'}</h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>{formatDate(look.createdAt)}</p>
                    </div>
                  </div>
              
              {user && user.uid === look.userId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      background: 'rgba(107, 114, 128, 0.1)',
                      border: '2px solid rgba(107, 114, 128, 0.2)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(103, 126, 234, 0.1)';
                      e.target.style.borderColor = 'rgba(103, 126, 234, 0.3)';
                      e.target.style.color = '#667eea';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                      e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'scale(1)';
                    }}>
                      <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '2px solid rgba(226, 232, 240, 0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(20px)',
                    padding: '8px',
                    minWidth: '160px'
                  }}>
                    <DropdownMenuItem style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.target.style.color = '#3b82f6';
                      e.target.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateX(0)';
                    }}>
                      <Edit style={{
                        width: '16px',
                        height: '16px',
                        color: 'currentColor'
                      }} />
                      <span>Edit Look</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#dc2626',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      background: 'transparent',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.target.style.color = '#ef4444';
                      e.target.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#dc2626';
                      e.target.style.transform = 'translateX(0)';
                    }}>
                      <Trash2 style={{
                        width: '16px',
                        height: '16px',
                        color: 'currentColor'
                      }} />
                      <span>Delete Look</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

{/* Caption */}
            <div style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px'
            }}>
              <p style={{
                color: '#374151',
                fontSize: '18px',
                lineHeight: '1.6',
                fontWeight: '500'
              }}>{look.caption}</p>
            </div>

            {/* Mood & Tags */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(226, 232, 240, 0.5)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Mood:</span>
                <span style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>{look.mood}</span>
              </div>
              
              {look.tags && look.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {look.tags.map((tag, index) => (
                    <span key={index} style={{
                      background: 'rgba(103, 126, 234, 0.1)',
                      color: '#667eea',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid rgba(103, 126, 234, 0.2)'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Color Palette */}
            {look.colorPalette && look.colorPalette.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(226, 232, 240, 0.5)'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Color Palette:</span>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {look.colorPalette.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '3px solid rgba(255, 255, 255, 0.8)',
                        backgroundColor: color,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      title={color}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              marginTop: '8px'
            }}>
              <button
                onClick={handleLike}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                  color: isLiked ? '#ef4444' : '#6b7280',
                  border: `2px solid ${isLiked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Heart style={{
                  width: '20px',
                  height: '20px',
                  fill: isLiked ? 'currentColor' : 'none'
                }} />
                <span>{likesCount}</span>
              </button>
              
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                border: '2px solid rgba(107, 114, 128, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <MessageCircle style={{ width: '20px', height: '20px' }} />
                <span>{comments.length}</span>
              </button>
              
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#6b7280',
                  border: '2px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Share2 style={{ width: '20px', height: '20px' }} />
                <span>Share</span>
              </button>
            </div>

{/* Professional Discussion Section */}
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0px 32px 64px rgba(0, 0, 0, 0.08), 0px 16px 32px rgba(0, 0, 0, 0.04), 0px 8px 16px rgba(0, 0, 0, 0.04)',
              borderRadius: '24px',
              marginTop: '48px',
              border: '1px solid rgba(226, 232, 240, 0.6)',
              backdropFilter: 'blur(20px)'
            }}>
              {/* Header Section */}
              <div style={{
                padding: '20px 24px 16px 24px',
                borderBottom: '1px solid rgba(226, 232, 240, 0.4)',
                background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.02), rgba(255, 255, 255, 0.8))'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>💬</span>
                    Discussion
                  </h3>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(103, 126, 234, 0.25)'
                  }}>
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                  </div>
                </div>
              </div>
              
              {/* Comment Form Section */}
              {user ? (
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.5), rgba(255, 255, 255, 0.8))',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.3)'
                }}>
                  <form onSubmit={handleComment} style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      flexShrink: 0
                    }}>
                      <SmartAvatar 
                        user={user} 
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: '2px solid rgba(103, 126, 234, 0.2)',
                          boxShadow: '0 2px 8px rgba(103, 126, 234, 0.15)'
                        }}
                      />
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div style={{
                        position: 'relative'
                      }}>
                        <textarea
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Share your thoughts about this look..."
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '16px 18px',
                            border: '2px solid rgba(226, 232, 240, 0.6)',
                            borderRadius: '12px',
                            resize: 'none',
                            fontSize: '15px',
                            lineHeight: '1.5',
                            fontFamily: 'inherit',
                            color: '#374151',
                            background: 'rgba(255, 255, 255, 0.9)',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(103, 126, 234, 0.5)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(103, 126, 234, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                          }}
                          maxLength={500}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '16px',
                          fontSize: '13px',
                          color: '#9ca3af',
                          fontWeight: '500'
                        }}>
                          {commentInput.length}/500
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#6b7280',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          <span style={{
                            fontSize: '16px'
                          }}>💡</span>
                          Be respectful and constructive in your feedback
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmittingComment || !commentInput.trim()}
                          style={{
                            background: isSubmittingComment || !commentInput.trim() 
                              ? 'rgba(156, 163, 175, 0.5)' 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: isSubmittingComment || !commentInput.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: isSubmittingComment || !commentInput.trim() 
                              ? 'none' 
                              : '0 4px 12px rgba(103, 126, 234, 0.3)',
                            transition: 'all 0.3s ease',
                            opacity: isSubmittingComment || !commentInput.trim() ? '0.6' : '1'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubmittingComment && commentInput.trim()) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 12px 30px rgba(103, 126, 234, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubmittingComment && commentInput.trim()) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 8px 20px rgba(103, 126, 234, 0.3)';
                            }
                          }}
                        >
                          {isSubmittingComment ? (
                            <>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid white',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></div>
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send style={{ width: '16px', height: '16px' }} />
                              Post Comment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.5), rgba(255, 255, 255, 0.8))'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    boxShadow: '0 8px 20px rgba(103, 126, 234, 0.3)'
                  }}>
                    <MessageCircle style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <h5 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    margin: '0 0 8px 0'
                  }}>Join the conversation</h5>
                  <p style={{
                    fontSize: '15px',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    maxWidth: '350px',
                    margin: '0 auto 20px auto'
                  }}>Sign in to share your thoughts and connect with the community</p>
                  <button style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(103, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(103, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(103, 126, 234, 0.3)';
                  }}>
                    Sign In to Comment
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div style={{
                padding: comments.length > 0 ? '20px 24px' : '0'
              }}>
                {comments.length > 0 ? (
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {comments.map((comment, index) => (
                      <div key={comment.id} style={{
                        position: 'relative',
                        background: 'rgba(248, 250, 252, 0.5)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(226, 232, 240, 0.6)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.borderColor = 'rgba(103, 126, 234, 0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(248, 250, 252, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start'
                        }}>
                          <SmartAvatar 
                            user={{ uid: comment.userId }} 
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: '2px solid rgba(103, 126, 234, 0.2)',
                              flexShrink: 0
                            }}
                          />
                          <div style={{
                            flex: 1,
                            minWidth: 0
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  fontWeight: '600',
                                  color: '#1a1a1a',
                                  fontSize: '16px'
                                }}>Anonymous User</span>
                                <div style={{
                                  width: '4px',
                                  height: '4px',
                                  backgroundColor: '#d1d5db',
                                  borderRadius: '50%'
                                }}></div>
                                <time style={{
                                  fontSize: '14px',
                                  color: '#6b7280',
                                  fontWeight: '500'
                                }}>
                                  {formatDate(comment.createdAt)}
                                </time>
                              </div>
                              {user && (user.uid === comment.userId || user.uid === look.userId) && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  style={{
                                    padding: '8px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: '0.7'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.opacity = '1';
                                    e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.opacity = '0.7';
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                  }}
                                  title="Delete comment"
                                >
                                  <Trash2 style={{ width: '14px', height: '14px' }} />
                                </button>
                              )}
                            </div>
                            <p style={{
                              fontSize: '16px',
                              color: '#374151',
                              lineHeight: '1.6',
                              margin: 0,
                              wordBreak: 'break-word'
                            }}>{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 32px'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px auto',
                      border: '2px solid rgba(103, 126, 234, 0.2)'
                    }}>
                      <MessageCircle style={{ width: '40px', height: '40px', color: '#667eea' }} />
                    </div>
                    <h5 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '12px',
                      margin: 0
                    }}>No comments yet</h5>
                    <p style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      maxWidth: '400px',
                      margin: '12px auto 0 auto'
                    }}>
                      Be the first to share your thoughts about this amazing look!
                    </p>
                  </div>
                )}
              </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
