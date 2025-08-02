'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toggleLikeVideo, deleteVideo } from '@/lib/fashiontv';
import { getUserProfile } from '@/lib/firebase';
import { Heart, MessageCircle, Play, Volume2, VolumeX, Trash2, MoreVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function VideoCard({ video, isActive, onCommentsToggle, isGloballyMuted, onGlobalMuteToggle, onVideoDeleted }) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(video.likes?.includes(user?.uid) || false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(video.comments || []);
  const videoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Auto-play video when active, pause when inactive
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        // Only reset time if video hasn't been played yet or is at the end
        if (videoRef.current.paused && (videoRef.current.currentTime === 0 || videoRef.current.ended)) {
          videoRef.current.currentTime = 0;
        }
        videoRef.current.play().catch(error => {
          console.log('Auto-play failed:', error);
        });
      } else {
        // Don't pause if user manually paused - let them control playback
        if (!videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [isActive]);

  // Sync global muted state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isGloballyMuted;
    }
  }, [isGloballyMuted]);

  // Fetch user role when user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.uid) {
        try {
          const userData = await getUserProfile(user.uid);
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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like videos",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await toggleLikeVideo(video.id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(error => {
          console.log('Video play failed:', error);
        });
      } else {
        videoRef.current.pause();
        // Show pause icon briefly for visual feedback
        setShowPauseIcon(true);
        setTimeout(() => setShowPauseIcon(false), 1000);
      }
    }
  };

  const handleMute = (e) => {
    e.stopPropagation();
    // Toggle global mute state for all videos
    const newMutedState = !isGloballyMuted;
    onGlobalMuteToggle(newMutedState);
    
    // Apply immediately to current video
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }
    console.log('Opening comments modal...');
    setShowComments(true);
    onCommentsToggle?.(true);
  };


  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        timestamp: new Date().toISOString()
      };
      setComments([...comments, comment]);
      setNewComment('');
      toast({
        title: "Comment Added",
        description: "Your comment has been posted",
      });
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    toast({
      title: "Comment Deleted",
      description: "Comment has been removed",
    });
  };

  const handleVideoLoad = (e) => {
    const videoElement = e.target;
    // Auto-play on load
    videoElement.play().catch(error => {
      // Auto-play failed - user interaction may be required
    });
  };

  const handleDelete = async () => {
    if (!user || !user.uid) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete videos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteVideo(video.id, user.uid);
      
      toast({
        title: "Video Deleted",
        description: "Your video has been successfully removed",
      });
      
      // Notify parent to remove video from feed
      if (onVideoDeleted) {
        onVideoDeleted(video.id);
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canDeleteVideo = () => {
    const isOwner = user && video.userId === user.uid;
    const isAdmin = user && userRole === 'admin';
    const canDelete = user && (isOwner || isAdmin);
    
    // Debug logging
    console.log('Delete permission check:', {
      videoId: video.id,
      userId: user?.uid,
      videoUserId: video.userId,
      userRole,
      isOwner,
      isAdmin,
      canDelete
    });
    
    return canDelete;
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden py-6">
      {/* Single Video Container - Full Screen */}
      <div className="w-full h-full relative rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          muted={isGloballyMuted}
          loop
          playsInline
          preload={isActive ? "auto" : "none"}
          controls={false}
          onClick={handleVideoClick}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
            }
          }}
          onLoadedData={(e) => {
            if (isActive) {
              handleVideoLoad(e);
            }
            // Ensure global muted state is applied on load
            if (videoRef.current) {
              videoRef.current.muted = isGloballyMuted;
            }
          }}
          onError={(e) => console.log('Video error:', e)}
        />

        {/* Play/Pause Overlay - No black background */}
        {(!isPlaying || showPauseIcon) && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className={`bg-black bg-opacity-50 rounded-full p-4 transition-opacity duration-300 ${
              showPauseIcon ? 'animate-pulse' : ''
            }`}>
              {!isPlaying ? (
                <Play className="text-white w-16 h-16" fill="white" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center">
                  <div className="w-2 h-8 bg-white rounded-sm mr-2"></div>
                  <div className="w-2 h-8 bg-white rounded-sm"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mute Button - Top Left, same height as action buttons */}
        <div className={`absolute top-12 md:top-6 left-3 md:left-4 z-20 transition-opacity duration-300 ${
          showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <button
            onClick={handleMute}
            style={{
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {isGloballyMuted ? (
              <VolumeX className="w-6 h-6 text-white drop-shadow-lg" />
            ) : (
              <Volume2 className="w-6 h-6 text-white drop-shadow-lg" />
            )}
          </button>
        </div>

        {/* Right Side Action Buttons - Raised much higher from profile and description */}
        <div className={`absolute right-3 md:right-4 bottom-32 md:bottom-28 lg:bottom-24 flex flex-col items-center justify-end z-20 transition-opacity duration-300 ${
          showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`} style={{ height: '220px', gap: '8px' }}>
          {/* Like Button */}
          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              minHeight: '60px',
              width: '56px'
            }}
          >
            <div style={{
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}>
              <Heart 
                className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : 'text-white'} drop-shadow-lg`} 
              />
            </div>
            <span className="text-white text-xs font-bold drop-shadow-md text-center" style={{
              minHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1',
              marginTop: '1px',
              letterSpacing: '0.5px'
            }}>
              {likesCount > 0 ? likesCount : ''}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleComment}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              minHeight: '80px',
              width: '60px'
            }}
          >
            <div style={{
              padding: '12px',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}>
              <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-sm font-semibold drop-shadow-md text-center" style={{
              minHeight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {comments.length > 0 ? comments.length : ''}
            </span>
          </button>

          {/* Delete Button - Only for video owner */}
          {canDeleteVideo() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              disabled={isDeleting}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                padding: '4px',
                minHeight: '60px',
                width: '56px',
                opacity: isDeleting ? 0.5 : 1
              }}
            >
              <div style={{
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                marginBottom: '-2px'
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'scale(1)';
                }
              }}>
                {isDeleting ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  <Trash2 className="w-5 h-5 text-red-400 drop-shadow-lg" />
                )}
              </div>
            </button>
          )}

        </div>

        {/* Bottom Caption Area */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent z-20 transition-opacity duration-300 ${
          showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <div className="flex items-end">
            {/* Caption Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="mb-2">
                <span className="text-white font-bold text-base">
                  @{video.userName || 'user'}
                </span>
              </div>
              
              <p className="text-white text-sm leading-relaxed mb-2">
                {isExpanded ? video.caption : `${video.caption?.substring(0, 100) || ''}${video.caption?.length > 100 ? '...' : ''}`}
                {video.caption?.length > 100 && (
                  <button 
                    className="text-gray-300 ml-2 hover:text-white transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    {isExpanded ? 'Show less' : 'more'}
                  </button>
                )}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {video.tags?.map((tag, index) => (
                  <span key={index} className="text-blue-400 text-sm hover:text-blue-300 cursor-pointer font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal - Enhanced with Inline CSS */}
      {showComments && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxHeight: '100vh',
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px 12px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #fafbfc 0%, #ffffff 100%)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0',
                  letterSpacing: '-0.025em'
                }}>Comments</h2>
                {comments.length > 0 && (
                  <span style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    border: '1px solid #e5e7eb'
                  }}>
                    {comments.length}
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setShowComments(false);
                  onCommentsToggle?.(false);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '18px',
                  color: '#6b7280'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.color = '#6b7280';
                }}
              >
                ×
              </button>
            </div>

            {/* Comments Content */}
            <div style={{
              flex: '1',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
              minHeight: '200px'
            }}>
              {comments.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <MessageCircle style={{ width: '28px', height: '28px', color: '#9ca3af' }} />
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>No comments yet</h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '15px',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {comments.map((comment) => (
                    <div key={comment.id} style={{
                      display: 'flex',
                      gap: '12px',
                      position: 'relative',
                      padding: '12px',
                      borderRadius: '16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: '0',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        border: '2px solid #ffffff'
                      }}>
                        <span style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      {/* Comment Content */}
                      <div style={{
                        flex: '1',
                        minWidth: '0'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '6px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            fontWeight: '600',
                            color: '#1f2937',
                            fontSize: '14px'
                          }}>
                            {comment.userName}
                          </span>
                          {comment.userId === user?.uid && (
                            <span style={{
                              fontSize: '11px',
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontWeight: '500',
                              border: '1px solid #bfdbfe'
                            }}>
                              You
                            </span>
                          )}
                          <span style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>
                            {new Date(comment.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          {/* Delete button for own comments */}
                          {comment.userId === user?.uid && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              style={{
                                marginLeft: 'auto',
                                color: '#9ca3af',
                                padding: '4px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '14px',
                                opacity: '0'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = '#ef4444';
                                e.target.style.backgroundColor = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = '#9ca3af';
                                e.target.style.backgroundColor = 'transparent';
                              }}
                              className="group-hover:opacity-100"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        
                        <p style={{
                          color: '#374151',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          margin: '0'
                        }}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div style={{
              borderTop: '1px solid #f1f5f9',
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                {/* User Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #6b7280, #374151)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0',
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                  border: '2px solid #ffffff'
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'Y'}
                  </span>
                </div>
                
                {/* Input Area */}
                <div style={{
                  flex: '1',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    style={{
                      flex: '1',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '20px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#fafbfc',
                      color: '#1f2937'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = '#fafbfc';
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: 'none',
                      cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      backgroundColor: newComment.trim() ? '#3b82f6' : '#f3f4f6',
                      color: newComment.trim() ? '#ffffff' : '#9ca3af',
                      boxShadow: newComment.trim() ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (newComment.trim()) {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newComment.trim()) {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'absolute',
          inset: '0',
          zIndex: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(0)',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(239, 68, 68, 0.1)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
              }}>
                <Trash2 style={{ width: '22px', height: '22px', color: '#dc2626' }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>Delete Video</h3>
            </div>
            
            <p style={{
              color: '#4b5563',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              Are you sure you want to delete <strong style={{ color: '#111827' }}>this video</strong>?
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '32px',
              margin: '0 0 32px 0'
            }}>
              This action cannot be undone and will permanently remove your video from the platform.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                  color: '#4b5563',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  opacity: isDeleting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.target.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.target.style.background = 'linear-gradient(135deg, #f9fafb, #f3f4f6)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  background: isDeleting 
                    ? 'linear-gradient(135deg, #f87171, #ef4444)' 
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isDeleting ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.target.style.background = 'linear-gradient(135deg, #b91c1c, #991b1b)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }
                }}
              >
                {isDeleting ? (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Deleting...</span>
                  </span>
                ) : (
                  'Delete Video'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from { 
            transform: translateY(-50px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .group:hover .group-hover\:opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

// Export memoized component for better performance
export default memo(VideoCard, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive && 
    prevProps.video.id === nextProps.video.id &&
    prevProps.onCommentsToggle === nextProps.onCommentsToggle &&
    prevProps.isGloballyMuted === nextProps.isGloballyMuted &&
    prevProps.onGlobalMuteToggle === nextProps.onGlobalMuteToggle
  );
});
