'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLivestreamById } from '@/lib/fashiontv';
import { 
  ArrowLeft,
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  User,
  Calendar,
  Play,
  Users,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function IndividualLiveStreamPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();
  const router = useRouter();
  const [stream, setStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(12814);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStream();
      initializeMockChat();
    }
  }, [id]);

  const fetchStream = async () => {
    try {
      setIsLoading(true);
      setStreamError(false);
      const streamData = await getLivestreamById(id);
      setStream(streamData);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (error) {
      console.error('Error fetching stream:', error);
      setStreamError(true);
      toast({
        title: "Error",
        description: "Failed to load live stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryStream = async () => {
    if (retryCount >= 3) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the stream after multiple attempts. Please check your connection or try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setIsReloading(true);
    setRetryCount(prev => prev + 1);
    
    setTimeout(async () => {
      await fetchStream();
      setIsReloading(false);
    }, 2000); // Wait 2 seconds before retrying
  };

  const handleRefreshStream = () => {
    setIsReloading(true);
    // Force iframe reload by changing key
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const src = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = src;
        setIsReloading(false);
        toast({
          title: "Stream Refreshed",
          description: "The live stream has been refreshed.",
        });
      }, 1000);
    } else {
      setIsReloading(false);
    }
  };

  const initializeMockChat = () => {
    const mockMessages = [
      {
        id: 1,
        user: 'FashionLover23',
        message: 'Amazing collection! 🔥',
        timestamp: '2m ago',
        avatar: 'FL'
      },
      {
        id: 2,
        user: 'StyleGuru',
        message: 'Where can I buy this dress?',
        timestamp: '1m ago',
        avatar: 'SG'
      },
      {
        id: 3,
        user: 'TrendWatcher',
        message: 'The colors are stunning!',
        timestamp: '30s ago',
        avatar: 'TW'
      },
      {
        id: 4,
        user: 'Fashionista',
        message: 'Best show this season 👑',
        timestamp: '15s ago',
        avatar: 'F'
      },
      {
        id: 5,
        user: 'StyleIcon',
        message: 'Love the music choice',
        timestamp: '5s ago',
        avatar: 'SI'
      }
    ];
    setChatMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !user) return;
    
    const newMessage = {
      id: Date.now(),
      user: user.displayName || user.email || 'You',
      message: chatInput,
      timestamp: 'now',
      avatar: (user.displayName || user.email || 'You').charAt(0).toUpperCase(),
      isOwn: true
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title || 'Fashion TV Live',
        text: 'Check out this amazing live fashion stream!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "The stream link has been copied to your clipboard.",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEmbedUrl = (stream) => {
    if (stream.platform === 'youtube') {
      // Handle different YouTube URL formats
      let videoId = null;
      
      // Extract video ID from various YouTube URL formats
      const watchMatch = stream.url.match(/[?\&]v=([^\&]+)/);
      const shortMatch = stream.url.match(/youtu\.be\/([^?\&]+)/);
      const embedMatch = stream.url.match(/embed\/([^?\&]+)/);
      
      if (watchMatch) {
        videoId = watchMatch[1];
      } else if (shortMatch) {
        videoId = shortMatch[1];
      } else if (embedMatch) {
        videoId = embedMatch[1];
      }
      
      // For live streams, check if it's a channel or live stream URL
      const channelId = stream.url.match(/channel\/([^/?]+)/)?.[1] || 
                       stream.url.match(/c\/([^/?]+)/)?.[1] || 
                       stream.url.match(/@([^/?]+)/)?.[1];
      
      if (videoId) {
        // For specific video IDs, use standard embed with additional params for live streams
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&enablejsapi=1&rel=0&modestbranding=1&controls=1&showinfo=0`;
      } else if (channelId) {
        // For channel-based live streams
        return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0&mute=0&enablejsapi=1&rel=0&modestbranding=1&controls=1`;
      }
    } else if (stream.platform === 'twitch') {
      // Handle Twitch URLs with proper parent domain
      const channelMatch = stream.url.match(/twitch\.tv\/([^/?]+)/);
      if (channelMatch) {
        const channel = channelMatch[1];
        const parentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        return `https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&autoplay=false&muted=false`;
      }
    }
    
    return stream.embedUrl || stream.url;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading live stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Stream Not Found</h1>
          <p className="mb-4">The live stream you're looking for doesn't exist.</p>
          <Link href="/social/fashiontv/live">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
              Browse Live Streams
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* CSS Animations and Mobile Responsive Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Custom scrollbar styles */
        .expandable-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .expandable-content::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        
        .expandable-content::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .expandable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-stack {
            flex-direction: column !important;
          }
          
          .mobile-full-width {
            width: 100% !important;
            min-width: 100% !important;
          }
          
          .mobile-padding {
            padding: 16px !important;
          }
          
          .mobile-small-padding {
            padding: 12px 16px !important;
          }
          
          .mobile-text-sm {
            font-size: 14px !important;
          }
          
          .mobile-text-xs {
            font-size: 12px !important;
          }
          
          .mobile-margin-sm {
            margin: 8px !important;
          }
          
          .mobile-hidden {
            display: none !important;
          }
          
          .mobile-video-height {
            min-height: 250px !important;
            height: 250px !important;
          }
          
          .mobile-chat-height {
            min-height: 300px !important;
            max-height: 300px !important;
          }
          
          .mobile-description-height {
            min-height: 150px !important;
            max-height: 200px !important;
          }
          
          .mobile-button-small {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-xs-padding {
            padding: 8px 12px !important;
          }
          
          .mobile-xs-margin {
            margin: 4px !important;
          }
          
          .mobile-xs-text {
            font-size: 11px !important;
          }
          
          .mobile-xs-video-height {
            min-height: 200px !important;
            height: 200px !important;
          }
        }
      `}</style>
      
      {/* Professional Header */}
      <div className="mobile-small-padding" style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
        padding: '20px 32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: '1px solid #333',
        borderRadius: '0 0 16px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#ef4444', 
              borderRadius: '50%', 
              animation: 'pulse 2s infinite' 
            }}></div>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '14px', letterSpacing: '0.5px' }}>LIVE</span>
          </div>
          <h1 style={{ color: 'white', fontWeight: '700', fontSize: '24px', margin: 0 }}>Fashion TV Live</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontWeight: '600' }}>Connected</span>
          </div>
          
          {/* Stream Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {streamError && (
              <button
                onClick={handleRetryStream}
                disabled={isReloading || retryCount >= 3}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: isReloading || retryCount >= 3 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isReloading ? 'Retrying...' : `Retry (${retryCount}/3)`}
              </button>
            )}
            
            <button
              onClick={handleRefreshStream}
              disabled={isReloading}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isReloading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isReloading ? (
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isReloading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-stack" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Video Area */}
        <div className="mobile-full-width" style={{ flex: 1, backgroundColor: '#000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Main Video Content */}
          <div className="mobile-margin-sm mobile-video-height mobile-xs-video-height" style={{ 
            flex: 1, 
            backgroundColor: '#000', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            borderRadius: '24px',
            margin: '16px',
            marginRight: '8px',
            overflow: 'hidden',
            minHeight: '400px'
          }}>
            {/* Video Player */}
            <div className="mobile-video-height mobile-xs-video-height" style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
              {stream && stream.url ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {stream.platform === 'youtube' ? (
                    <iframe
                      src={getEmbedUrl(stream)}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '24px'
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={stream.title}
                    />
                  ) : stream.platform === 'twitch' ? (
                    <iframe
                      src={getEmbedUrl(stream)}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '24px'
                      }}
                      allowFullScreen
                      title={stream.title}
                    />
                  ) : stream.platform === 'local' ? (
                    /* Local Live Stream Viewer - Disabled */
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '24px',
                      position: 'relative'
                    }}>
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <Eye style={{ width: '64px', height: '64px', margin: '0 auto 20px auto', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Live Streaming Disabled</h3>
                        <p style={{ opacity: 0.8 }}>Go Live functionality has been removed. Only external stream URLs are supported.</p>
                      </div>
                    </div>
                  ) : (
                    /* Generic video player for other platforms */
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #d946ef 70%, #ec4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '24px',
                      position: 'relative'
                    }}>
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          background: 'rgba(255, 255, 255, 0.2)', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 20px auto', 
                          backdropFilter: 'blur(10px)', 
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }} onClick={() => window.open(stream.url, '_blank')}>
                          <ExternalLink style={{ width: '32px', height: '32px' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>External Live Stream</h3>
                        <p style={{ opacity: 0.8, marginBottom: '16px' }}>Click to open in new window</p>
                        <button
                          onClick={() => window.open(stream.url, '_blank')}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          Watch Live Stream
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Live indicator overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(220, 38, 38, 0.9)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 10
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    LIVE
                  </div>
                </div>
              ) : (
                /* Fallback when no stream URL */
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #d946ef 70%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '24px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <Play style={{ width: '64px', height: '64px', margin: '0 auto 20px auto', opacity: 0.7 }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Live Stream</h3>
                    <p style={{ opacity: 0.8 }}>Stream will appear here when available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Info Section - Expandable */}
          <div className="mobile-padding mobile-margin-sm mobile-description-height" style={{ 
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)', 
            backdropFilter: 'blur(20px)', 
            padding: '20px 32px',
            margin: '24px 16px 16px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '200px',
            maxHeight: isDescriptionExpanded ? '500px' : '200px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Stream Title */}
            <h1 className="mobile-text-sm" style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '8px',
              margin: '0 0 8px 0',
              lineHeight: 1.3,
              flexShrink: 0
            }}>
              {stream?.title || 'Milan Fashion Week 2024 - Spring Collection'}
            </h1>
            
            {/* Tags Section - Above Description */}
            <div style={{ marginBottom: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: '12px', 
                  fontWeight: '500' 
                }}>{stream?.platform || 'Fashion Week'}</span>
                <span style={{ 
                  backgroundColor: '#059669', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: '12px', 
                  fontWeight: '500' 
                }}>Live Now</span>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {!isDescriptionExpanded ? (
                /* Collapsed State - Show short description */
                <div>
                  <p style={{ 
                    color: '#d1d5db', 
                    marginBottom: '8px', 
                    lineHeight: 1.4,
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {stream?.description || 'Experience the latest trends from top designers in this exclusive live showcase. Featuring collections from renowned fashion houses and emerging talents from around the world.'}
                  </p>
                  
                  {/* Show More Button */}
                  <button
                    onClick={() => setIsDescriptionExpanded(true)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      position: 'relative',
                      zIndex: 20
                    }}
                  >
                    <span>Show More</span>
                    <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Expanded State - Show scrollable content */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {/* Show Less Button at top */}
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      alignSelf: 'flex-start',
                      position: 'relative',
                      zIndex: 20,
                      marginBottom: '8px'
                    }}
                  >
                    <span>Show Less</span>
                    <svg style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Scrollable Content */}
                  <div 
                    className="expandable-content"
                    style={{
                      flex: 1,
                      minHeight: '200px',
                      maxHeight: '250px',
                      overflowY: 'scroll',
                      paddingRight: '8px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: 'rgba(17, 24, 39, 0.7)',
                      position: 'relative',
                      zIndex: 1
                    }}>
                  {/* Full Description */}
                  <div style={{ 
                    background: 'rgba(55, 65, 81, 0.3)', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    marginBottom: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.3)'
                  }}>
                    <h4 style={{ color: '#f9fafb', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Full Description</h4>
                    <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>
                      {stream?.description || 'Experience the latest trends from top designers in this exclusive live showcase. Featuring collections from renowned fashion houses and emerging talents from around the world. Join us for an immersive journey through the world of haute couture and ready-to-wear fashion.'}
                      <br/><br/>
                      Discover the artistry behind each piece as we showcase stunning runway collections, exclusive designer interviews, and behind-the-scenes moments from the fashion industry's most prestigious events. From Milan to Paris, New York to London, we bring you comprehensive coverage of fashion weeks and special designer showcases.
                      <br/><br/>
                      Our expert commentary team provides insights into the creative process, design inspiration, and the cultural impact of each collection. Whether you're a fashion enthusiast, industry professional, or simply curious about style trends, this stream offers something for everyone.
                    </p>
                  </div>
                  
                  {/* Stream Details */}
                  <div style={{ 
                    background: 'rgba(55, 65, 81, 0.3)', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    marginBottom: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.3)'
                  }}>
                    <h4 style={{ color: '#f9fafb', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Stream Details</h4>
                    <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.4 }}>
                      <div style={{ marginBottom: '4px' }}><strong>Platform:</strong> {stream?.platform || 'External'}</div>
                      <div style={{ marginBottom: '4px' }}><strong>Quality:</strong> HD 1080p</div>
                      <div style={{ marginBottom: '4px' }}><strong>Language:</strong> English</div>
                      <div style={{ marginBottom: '4px' }}><strong>Category:</strong> Fashion & Style</div>
                      <div style={{ marginBottom: '4px' }}><strong>Duration:</strong> Live Stream</div>
                      <div style={{ marginBottom: '4px' }}><strong>Audience:</strong> All Ages</div>
                      <div><strong>Broadcast Region:</strong> Global</div>
                    </div>
                  </div>
                  
                  {/* Featured Content */}
                  <div style={{ 
                    background: 'rgba(55, 65, 81, 0.3)', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    marginBottom: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.3)'
                  }}>
                    <h4 style={{ color: '#f9fafb', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Featured Content</h4>
                    <ul style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.4, margin: 0, paddingLeft: '16px' }}>
                      <li style={{ marginBottom: '4px' }}>Exclusive runway shows from top designers</li>
                      <li style={{ marginBottom: '4px' }}>Designer interviews and creative insights</li>
                      <li style={{ marginBottom: '4px' }}>Behind-the-scenes fashion week coverage</li>
                      <li style={{ marginBottom: '4px' }}>Style trend analysis and commentary</li>
                      <li style={{ marginBottom: '4px' }}>Fashion history and cultural context</li>
                      <li>Interactive Q&A sessions with industry experts</li>
                    </ul>
                  </div>
                  
                  {/* About This Stream */}
                  <div style={{ 
                    background: 'rgba(55, 65, 81, 0.3)', 
                    padding: '12px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.3)'
                  }}>
                    <h4 style={{ color: '#f9fafb', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>About Fashion TV Live</h4>
                    <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                      Fashion TV Live is your premier destination for live fashion content, bringing you closer to the world's most exciting fashion events and designer showcases.
                    </p>
                    <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.4, margin: 0 }}>
                      Stay connected with the latest fashion trends, discover emerging designers, and experience the glamour of international fashion weeks from the comfort of your home.
                    </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom Fixed Section - Actions Only */}
            <div style={{ flexShrink: 0, paddingTop: '12px' }}>
              
              {/* Actions Only */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleShare}
                  className="mobile-button-small"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <Share2 style={{ width: '16px', height: '16px' }} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat Panel */}
        <div className="mobile-full-width mobile-margin-sm mobile-chat-height" style={{ 
          width: '320px', 
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', 
          display: 'flex', 
          flexDirection: 'column', 
          flexShrink: 0,
          margin: '16px 16px 16px 8px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Chat Header */}
          <div style={{ 
            padding: '24px', 
            borderBottom: '1px solid rgba(55, 65, 81, 0.5)', 
            flexShrink: 0 
          }}>
            <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0', fontSize: '18px' }}>Live Chat</h3>
            <div style={{ color: '#9ca3af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>{chatMessages.length + Math.floor(Math.random() * 100)} active</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px 24px', 
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '16px',
                background: msg.isOwn ? 'rgba(59, 130, 246, 0.2)' : 'rgba(75, 85, 99, 0.3)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {msg.avatar}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontWeight: '500', 
                      fontSize: '13px', 
                      color: msg.isOwn ? '#60a5fa' : '#d1d5db' 
                    }}>
                      {msg.user}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{msg.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'white', wordWrap: 'break-word', margin: 0 }}>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ 
            padding: '20px 24px', 
            borderTop: '1px solid rgba(55, 65, 81, 0.5)', 
            flexShrink: 0 
          }}>
            {user ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(55, 65, 81, 0.8)',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  style={{
                    background: chatInput.trim() 
                      ? 'linear-gradient(135deg, #dc2626, #ec4899)' 
                      : 'rgba(75, 85, 99, 0.5)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Send
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '14px', marginBottom: '12px' }}>Sign in to join the conversation</div>
                <Link href="/login">
                  <button style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <Link href="/social/fashiontv/live">
        <button style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
      </Link>
    </div>
  );
}
