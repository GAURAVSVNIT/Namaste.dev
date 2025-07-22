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
  const [viewerCount, setViewerCount] = useState(12814); // Mock viewer count

  useEffect(() => {
    if (id) {
      fetchStream();
      initializeMockChat();
    }
  }, [id]);

  const fetchStream = async () => {
    try {
      setIsLoading(true);
      const streamData = await getLivestreamById(id);
      setStream(streamData);
      
      // Add some mock viewer interaction
      setTimeout(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 10));
      }, 3000);
      
    } catch (error) {
      console.error('Error fetching stream:', error);
      toast({
        title: "Error",
        description: "Failed to load live stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      const channelId = stream.url.match(/channel\/([^/?]+)/)?.[1] || 
                       stream.url.match(/c\/([^/?]+)/)?.[1] || 
                       stream.url.match(/@([^/?]+)/)?.[1];
      
      if (channelId) {
        return `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
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
    <div style={{ height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Professional Header */}
      <div style={{ 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <Eye style={{ width: '18px', height: '18px' }} />
            <span style={{ fontWeight: '600' }}>{viewerCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Video Area */}
        <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Main Video Content */}
          <div style={{ 
            flex: 1, 
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #d946ef 70%, #ec4899 100%)', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            borderRadius: '24px',
            margin: '16px',
            marginRight: '8px',
            overflow: 'hidden'
          }}>
            {/* Video Player or Elegant Fallback */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '40px' }}>
              <div style={{ textAlign: 'center', color: 'white', maxWidth: '600px' }}>
                {/* Play Button */}
                <div style={{ 
                  width: '96px', 
                  height: '96px', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 32px auto', 
                  backdropFilter: 'blur(10px)', 
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <Play style={{ width: '40px', height: '40px', marginLeft: '4px' }} />
                </div>
                
                {/* Stream Title */}
                <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', margin: '0 0 16px 0' }}>Fashion Week 2024</h2>
                <p style={{ fontSize: '24px', marginBottom: '32px', opacity: 0.9, margin: '0 0 32px 0' }}>Milan Collection Showcase</p>
                
                {/* Description */}
                <p style={{ 
                  opacity: 0.8, 
                  lineHeight: 1.6, 
                  marginBottom: '32px', 
                  maxWidth: '500px', 
                  margin: '0 auto',
                  fontSize: '16px'
                }}>
                  Experience the latest trends from top designers in this exclusive live showcase. 
                  Featuring collections from renowned fashion houses and emerging talents.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Info Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)', 
            backdropFilter: 'blur(20px)', 
            padding: '32px',
            margin: '8px 16px 16px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ maxWidth: '100%' }}>
              {/* Stream Title and Description */}
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: 'white', 
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>
                {stream.title || 'Milan Fashion Week 2024 - Spring Collection'}
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginBottom: '20px', 
                lineHeight: 1.6,
                margin: '0 0 20px 0',
                fontSize: '16px'
              }}>
                {stream.description || 'Experience the latest trends from top designers in this exclusive live showcase. Featuring collections from renowned fashion houses and emerging talents.'}
              </p>
              
              {/* Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>Fashion Week</span>
                <span style={{ 
                  backgroundColor: '#059669', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>Spring 2024</span>
                <span style={{ 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>Milan</span>
              </div>
              
              {/* Stats and Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>{viewerCount.toLocaleString()}</span>
                    <span style={{ color: '#9ca3af' }}>watching</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>3,421</span>
                  </div>
                </div>
                
                <button
                  onClick={handleShare}
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
                >
                  <Share2 style={{ width: '16px', height: '16px' }} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat Panel */}
        <div style={{ 
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
