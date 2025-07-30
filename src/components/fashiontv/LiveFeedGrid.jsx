'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Calendar, User, Play, Maximize2, Trash2, AlertTriangle } from 'lucide-react';
import { deleteLivestream } from '@/lib/fashiontv';
import { toast } from '@/hooks/use-toast';

export default function LiveFeedGrid({ streams, currentUser, onStreamDeleted }) {
  const [selectedStream, setSelectedStream] = useState(null);
  const [deletingStream, setDeletingStream] = useState(null);
  const [confirmDeleteStream, setConfirmDeleteStream] = useState(null);

  const openModal = (stream) => {
    setSelectedStream(stream);
  };

  const closeModal = () => {
    setSelectedStream(null);
  };

  const handleDeleteStream = async (streamId) => {
    if (!currentUser) return;
    
    try {
      setDeletingStream(streamId);
      await deleteLivestream(streamId);
      
      toast({
        title: "Stream Deleted",
        description: "Your live stream has been successfully removed",
      });
      
      // Callback to refresh the streams list
      if (onStreamDeleted) {
        onStreamDeleted(streamId);
      }
      
      setConfirmDeleteStream(null);
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast({
        title: "Error",
        description: "Failed to delete the stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingStream(null);
    }
  };

  const confirmDelete = (stream) => {
    setConfirmDeleteStream(stream);
  };

  const canDeleteStream = (stream) => {
    // Allow deletion if user owns the stream OR if user has admin privileges
    return currentUser && (
      stream.userId === currentUser.uid ||
      hasAdminAccess(currentUser, stream)
    );
  };
  
  const hasAdminAccess = (user, stream) => {
    // Allow admin access for system/demo streams or specific admin users
    return user && (
      stream.userId?.startsWith('sample-user') || // System demo streams
      user.email === 'admin@namaste.dev' || // Replace with your admin email
      user.role === 'admin' // If you implement role-based access
    );
  };

  const renderYouTubeEmbed = (stream) => {
    // Extract channel ID from URL patterns
    const channelId = stream.url.match(/channel\/([^/?]+)/)?.[1] || 
                     stream.url.match(/c\/([^/?]+)/)?.[1] || 
                     stream.url.match(/@([^/?]+)/)?.[1];
    
    if (channelId) {
      return `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
    }
    return stream.embedUrl;
  };

  const renderTwitchEmbed = (stream) => {
    const channelName = stream.url.match(/twitch\.tv\/([^/?]+)/)?.[1];
    return (
      <div className="w-full h-full">
        <div id={`twitch-embed-${stream.id}`} className="w-full h-full"></div>
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Twitch !== 'undefined') {
                new Twitch.Embed('twitch-embed-${stream.id}', {
                  width: '100%',
                  height: '100%',
                  channel: '${channelName}',
                  parent: ['${window.location.hostname}'],
                  layout: 'video'
                });
              }
            `
          }}
        />
      </div>
    );
  };

  const getEmbedUrl = (stream) => {
    if (stream.platform === 'youtube') {
      return renderYouTubeEmbed(stream);
    }
    return stream.embedUrl;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Professional Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '24px',
        padding: '0'
      }}>
        {streams.map((stream) => (
          <div key={stream.id} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
{/* Stream Preview */}
            <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#111827' }}>
              {stream.platform === 'youtube' ? (
                (() => {
                  const videoIdMatch = stream.url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+\&v=))((\w|-){11})/);
                  const videoId = videoIdMatch ? videoIdMatch[1] : null;
                  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
                  return videoId ? (
                    <img
                      src={thumbnailUrl}
                      alt={stream.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                    />
                  ) : null;
                })()
              ) : stream.platform === 'twitch' ? (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #9146ff, #6441a4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '16px 16px 0 0'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <Play style={{ width: '64px', height: '64px', margin: '0 auto 8px auto' }} />
                    <p style={{ fontSize: '14px', margin: 0 }}>Click to watch on Twitch</p>
                  </div>
                </div>
              ) : stream.platform === 'local' ? (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #d946ef 70%, #ec4899 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '16px 16px 0 0',
                  position: 'relative'
                }}>
                  {/* Animated background effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}></div>
                  <div style={{ textAlign: 'center', color: 'white', zIndex: 1 }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Live Camera Stream</h4>
                    <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>Click to watch live</p>
                  </div>
                </div>
              ) : null}
              
              {/* Platform Badge */}
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <span style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'white',
                  background: stream.platform === 'youtube' ? 'linear-gradient(135deg, #ff0000, #cc0000)' :
                           stream.platform === 'twitch' ? 'linear-gradient(135deg, #9146ff, #6441a4)' :
                           stream.platform === 'local' ? 'linear-gradient(135deg, #7c3aed, #ec4899)' :
                           'linear-gradient(135deg, #6b7280, #4b5563)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {stream.platform.toUpperCase()}
                </span>
              </div>

              {/* Live Badge */}
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  animation: 'pulse 2s infinite',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  🔴 LIVE
                </span>
              </div>
              
              {/* Ownership Badge */}
              {currentUser && stream.userId === currentUser.uid && (
                <div style={{ position: 'absolute', top: '12px', right: '80px' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '700',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    Your Stream
                  </span>
                </div>
              )}

              {/* Expand Button */}
              <button
                onClick={() => openModal(stream)}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Maximize2 style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Professional Stream Info */}
            <div style={{ padding: '24px' }}>
              <h3 style={{ 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '12px', 
                fontSize: '18px',
                lineHeight: '1.4',
                margin: '0 0 12px 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{stream.title}</h3>
              
              {stream.description && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.5'
                }}>{stream.description}</p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                <User style={{ width: '16px', height: '16px' }} />
                <span style={{ fontWeight: '500' }}>{stream.userName}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                <span>{formatDate(stream.createdAt)}</span>
              </div>

{/* Professional Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link
                  href={`/social/fashiontv/live/${stream.id}`}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Watch Live
                </Link>
                {stream.platform !== 'local' && stream.url && (
                  <a
                    href={stream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px',
                      background: 'rgba(243, 244, 246, 0.8)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(209, 213, 219, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ExternalLink style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  </a>
                )}
                {canDeleteStream(stream) && (
                  <button
                    onClick={() => confirmDelete(stream)}
                    disabled={deletingStream === stream.id}
                    style={{
                      padding: '12px',
                      background: deletingStream === stream.id ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.8)',
                      color: '#dc2626',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(220, 38, 38, 0.2)',
                      cursor: deletingStream === stream.id ? 'not-allowed' : 'pointer',
                      opacity: deletingStream === stream.id ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete your stream"
                  >
                    {deletingStream === stream.id ? (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #dc2626',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    ) : (
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Full Screen View */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedStream.title}</h2>
              <div className="flex items-center space-x-2">
                {canDeleteStream(selectedStream) && (
                  <button
                    onClick={() => {
                      confirmDelete(selectedStream);
                      closeModal();
                    }}
                    disabled={deletingStream === selectedStream.id}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete your stream"
                  >
                    {deletingStream === selectedStream.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {selectedStream.platform === 'youtube' ? (
                  <iframe
                    src={getEmbedUrl(selectedStream)}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                    title={selectedStream.title}
                  />
                ) : selectedStream.platform === 'twitch' ? (
                  <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <a
                        href={selectedStream.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 px-6 py-3 rounded-lg transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch on Twitch</span>
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Stream Details */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{selectedStream.userName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedStream.createdAt)}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedStream.platform === 'youtube' ? 'bg-red-100 text-red-800' : 
                  selectedStream.platform === 'twitch' ? 'bg-purple-100 text-purple-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedStream.platform.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDeleteStream && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            transform: 'translateY(-10px)'
          }}>
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
                <AlertTriangle style={{ width: '22px', height: '22px', color: '#dc2626' }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>Delete Live Stream</h3>
            </div>
            
            <p style={{
              color: '#4b5563',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              Are you sure you want to delete <strong style={{ color: '#111827' }}>"{confirmDeleteStream.title}"</strong>?
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '32px',
              margin: '0 0 32px 0'
            }}>
              This action cannot be undone and will permanently remove your live stream from the platform.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <button
                onClick={() => setConfirmDeleteStream(null)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                  color: '#4b5563',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f9fafb, #f3f4f6)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStream(confirmDeleteStream.id)}
                disabled={deletingStream === confirmDeleteStream.id}
                style={{
                  flex: 1,
                  background: deletingStream === confirmDeleteStream.id 
                    ? 'linear-gradient(135deg, #f87171, #ef4444)' 
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: 'none',
                  cursor: deletingStream === confirmDeleteStream.id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: deletingStream === confirmDeleteStream.id ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (deletingStream !== confirmDeleteStream.id) {
                    e.target.style.background = 'linear-gradient(135deg, #b91c1c, #991b1b)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletingStream !== confirmDeleteStream.id) {
                    e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }
                }}
              >
                {deletingStream === confirmDeleteStream.id ? (
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
                  'Delete Stream'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Twitch Embed SDK */}
      <script src="https://embed.twitch.tv/embed/v1.js"></script>
    </>
  );
}
