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
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <div key={stream.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Stream Preview */}
            <div className="relative aspect-video bg-gray-900">
              {stream.platform === 'youtube' ? (
                <iframe
                  src={getEmbedUrl(stream)}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                  title={stream.title}
                />
              ) : stream.platform === 'twitch' ? (
                <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">Click to watch on Twitch</p>
                  </div>
                </div>
              ) : null}
              
              {/* Platform Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  stream.platform === 'youtube' ? 'bg-red-600 text-white' : 
                  stream.platform === 'twitch' ? 'bg-purple-600 text-white' : 
                  'bg-gray-600 text-white'
                }`}>
                  {stream.platform.toUpperCase()}
                </span>
              </div>

              {/* Live Badge */}
              <div className="absolute top-2 right-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                  🔴 LIVE
                </span>
              </div>
              
              {/* Ownership Badge */}
              {currentUser && stream.userId === currentUser.uid && (
                <div className="absolute top-2 right-16">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Your Stream
                  </span>
                </div>
              )}

              {/* Expand Button */}
              <button
                onClick={() => openModal(stream)}
                className="absolute bottom-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stream Info */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{stream.title}</h3>
              
              {stream.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{stream.description}</p>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span>{stream.userName}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(stream.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(stream)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Watch Live
                </button>
                <a
                  href={stream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {canDeleteStream(stream) && (
                  <button
                    onClick={() => confirmDelete(stream)}
                    disabled={deletingStream === stream.id}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete your stream"
                  >
                    {deletingStream === stream.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Live Stream</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>"{confirmDeleteStream.title}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone and will permanently remove your live stream from the platform.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmDeleteStream(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStream(confirmDeleteStream.id)}
                disabled={deletingStream === confirmDeleteStream.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
              >
                {deletingStream === confirmDeleteStream.id ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
