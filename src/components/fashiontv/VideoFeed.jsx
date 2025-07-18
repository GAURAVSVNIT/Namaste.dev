'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAllVideos } from '@/lib/fashiontv';
import VideoCard from './VideoCard';

export default function VideoFeed({ onCommentsToggle }) {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    fetchInitialVideos();
  }, []);

  const fetchInitialVideos = async () => {
    try {
      setIsLoading(true);
      const { videos: videoData, lastDocument } = await getAllVideos(10);
      setVideos(videoData);
      setLastDoc(lastDocument);
      setHasMore(videoData.length === 10);
    } catch (error) {
      console.error('Error fetching initial videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const { videos: moreVideos, lastDocument } = await getAllVideos(10, lastDoc);
      
      if (moreVideos.length > 0) {
        setVideos(prev => [...prev, ...moreVideos]);
        setLastDoc(lastDocument);
        setHasMore(moreVideos.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, lastDoc]);

  // Use Intersection Observer for better performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setCurrentVideoIndex(index);
            
            // Load more videos when approaching the end
            if (index >= videos.length - 2 && hasMore && !isLoading) {
              loadMoreVideos();
            }
          }
        });
      },
      {
        threshold: 0.7, // Video is considered active when 70% visible
        rootMargin: '0px'
      }
    );

    const videoElements = document.querySelectorAll('[data-video-container]');
    videoElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [videos, loadMoreVideos, hasMore, isLoading]);
  if (isLoading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Videos Found</h3>
          <p className="text-gray-500">Be the first to upload a video!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Video Feed - Instagram Style */}
      <div 
        ref={scrollRef}
        className="snap-y snap-mandatory h-full overflow-y-scroll scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="snap-start w-full h-screen flex items-center justify-center"
            data-video-container
            data-index={index}
          >
            <VideoCard 
              video={video} 
              isActive={index === currentVideoIndex}
              onCommentsToggle={onCommentsToggle}
            />
          </div>
        ))}
        
        {/* Loading indicator for more videos */}
        {isLoading && videos.length > 0 && (
          <div className="w-full h-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
}
