'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Eye, Users, Clock } from 'lucide-react';

const LiveStreamsList = ({ onStreamSelect }) => {
  const { user } = useAuth();
  const [liveStreams, setLiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query for live streams
    const streamsQuery = query(
      collection(db, 'livestreams'),
      where('status', '==', 'live'),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(streamsQuery, (snapshot) => {
      const streams = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        streams.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          createdAt: data.createdAt?.toDate()
        });
      });
      
      setLiveStreams(streams);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching live streams:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStreamClick = (stream) => {
    setSelectedStream(stream);
    if (onStreamSelect) {
      onStreamSelect(stream);
    }
  };

  const closeStreamViewer = () => {
    setSelectedStream(null);
    if (onStreamSelect) {
      onStreamSelect(null);
    }
  };

  const formatDuration = (startTime) => {
    if (!startTime) return '0m';
    
    const now = new Date();
    const diffMs = now - startTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  // Show stream viewer if a stream is selected
  if (selectedStream) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl h-full max-h-[80vh] bg-gray-900 rounded-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={closeStreamViewer}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Stream Info Header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/50 to-transparent p-6 z-10">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedStream.title}</h2>
            <div className="flex items-center gap-4 text-gray-300 text-sm">
              <span className="flex items-center gap-1">
                <Eye size={16} />
                Live
              </span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {selectedStream.userName}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {formatDuration(selectedStream.startTime)}
              </span>
            </div>
            {selectedStream.description && (
              <p className="text-gray-400 text-sm mt-2">{selectedStream.description}</p>
            )}
          </div>

          {/* Stream Viewer - Go Live functionality removed */}
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <Eye size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Live Streaming Disabled</h3>
              <p className="text-gray-400">Go Live functionality has been removed. Only external stream URLs are supported.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Live Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Live Streams</h2>
      
      {liveStreams.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Eye size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-300 text-lg mb-2">No live streams available</p>
          <p className="text-gray-400">Check back later or be the first to go live!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              onClick={() => handleStreamClick(stream)}
              className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
            >
              {/* Thumbnail/Preview */}
              <div className="relative h-48 bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                    <Eye size={24} className="text-white" />
                  </div>
                  <p className="text-white font-semibold">Click to Watch</p>
                </div>
                
                {/* Live Badge */}
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {formatDuration(stream.startTime)}
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
                  {stream.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                  <Users size={14} />
                  {stream.userName}
                </p>
                {stream.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {stream.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveStreamsList;
