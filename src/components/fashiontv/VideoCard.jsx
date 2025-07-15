'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toggleLikeVideo } from '@/lib/fashiontv';
import { Heart, MessageCircle, Play, Volume2, VolumeX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function VideoCard({ video, isActive, onCommentsToggle }) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(video.likes?.includes(user?.uid) || false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(video.comments || []);
  const videoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);

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

  // Sync muted state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

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
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
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
    setShowComments(true);
    onCommentsToggle?.(true);
  };


  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
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

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden py-6">
      {/* Single Video Container - Full Screen */}
      <div className="w-full h-full relative rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          muted={isMuted}
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
            // Ensure muted state is applied on load
            if (videoRef.current) {
              videoRef.current.muted = isMuted;
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

        {/* Mute Button - Top Left */}
        <div className={`absolute top-4 left-4 z-20 transition-opacity duration-300 ${
          showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <button
            onClick={handleMute}
            className="p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition-all"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white drop-shadow-lg" />
            ) : (
              <Volume2 className="w-6 h-6 text-white drop-shadow-lg" />
            )}
          </button>
        </div>

        {/* Right Side Action Buttons */}
        <div className={`absolute right-4 bottom-32 flex flex-col items-center space-y-6 z-20 transition-opacity duration-300 ${
          showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center space-y-1 group"
          >
            <div className="p-2 group-hover:bg-black group-hover:bg-opacity-10 rounded-full transition-all">
              <Heart 
                className={`w-8 h-8 ${isLiked ? 'text-red-500 fill-current' : 'text-white'} drop-shadow-lg`} 
              />
            </div>
            <span className="text-white text-xs font-medium drop-shadow-md">
              {likesCount > 0 ? likesCount : ''}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleComment}
            className="flex flex-col items-center space-y-1 group"
          >
            <div className="p-2 group-hover:bg-black group-hover:bg-opacity-10 rounded-full transition-all">
              <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow-md">
              {comments.length > 0 ? comments.length : ''}
            </span>
          </button>

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

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-30 flex items-end">
          <div className="w-full bg-white rounded-t-3xl max-h-[75vh] overflow-hidden shadow-2xl">
            {/* Comments Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <button
                onClick={() => {
                  setShowComments(false);
                  onCommentsToggle?.(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-96">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No comments yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 py-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-gray-900 text-sm">{comment.userName}</span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {/* Delete button - only show for current user's comments */}
                        {(comment.userName === user?.displayName || comment.userName === 'Anonymous') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 transition-all duration-200 p-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mt-1 leading-relaxed">{comment.text}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">Reply</button>
                        <button className="text-xs text-gray-500 hover:text-red-500 font-medium">♥</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'Y'}
                  </span>
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-0 py-2 border-0 bg-transparent text-sm placeholder-gray-500 focus:outline-none focus:ring-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
              <div className="mt-2 ml-11 h-px bg-gray-200"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export memoized component for better performance
export default memo(VideoCard, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive && 
    prevProps.video.id === nextProps.video.id &&
    prevProps.onCommentsToggle === nextProps.onCommentsToggle
  );
});
