'use client';

import React from 'react';
import '../static/FeaturedVideos.css';

const FeaturedVideos = () => {
  const videos = [
    {
      id: 1,
      title: '1',
      thumbnail: 'https://picsum.photos/seed/video1/400/300',
      videoUrl: '#'
    },
    {
      id: 2,
      title: '2',
      thumbnail: 'https://picsum.photos/seed/video2/400/300',
      videoUrl: '#'
    },
    {
      id: 3,
      title: '3',
      thumbnail: 'https://picsum.photos/seed/video3/400/300',
      videoUrl: '#'
    }
  ];

  return (
    <div className="featured-videos-container">
      <div className="featured-videos-content">
        <div className="featured-videos-text">
          <h2 className="featured-videos-title">Upload Your Look!</h2>
          <p className="featured-videos-subtitle">Get featured on our page</p>
          <button className="upload-button">Start Uploading</button>
        </div>
        
        <div className="videos-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="play-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="white"/>
                  </svg>
                </div>
              </div>
              <h3 className="video-title">{video.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedVideos;
