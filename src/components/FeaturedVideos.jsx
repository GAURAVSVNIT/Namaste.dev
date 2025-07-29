'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import '../static/FeaturedVideos.css';

const FeaturedVideos = () => {
  const videos = [
    {
      id: 1,
      title: 'Ephemeral Elegance',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=1500&fit=crop&auto=format&q=80',
      videoUrl: '#'
    },
    {
      id: 2,
      title: 'Urban Poetry in Motion',
      thumbnail: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?_gl=1*1n6hprm*_ga*MTIyMDkxNTk1Ny4xNzUzNjgwNTU2*_ga_8JE65Q40S6*czE3NTM2ODA1NTYkbzEkZzEkdDE3NTM2ODA1NjgkajQ4JGwwJGgw',
      videoUrl: '#'
    },
    {
      id: 3,
      title: 'The Art of Being',
      thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1500&fit=crop&auto=format&q=80',
      videoUrl: '#'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Auto-scroll every 5 seconds
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="featured-videos-section">
      <div className="featured-videos-content">
        <div className="featured-videos-text">
          <h2 className="featured-videos-title">Share Your Vision</h2>
          <p className="featured-videos-subtitle">
            Become a part of our visual story. Upload your style and get featured in our curated collection of motion art.
          </p>
          <button className="upload-button">Define Your Style</button>
        </div>
        
        <div className="video-carousel-window">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              className="video-slide"
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
            >
              <img src={videos[currentIndex].thumbnail} alt={videos[currentIndex].title} className="video-thumbnail-image" />
              <div className="video-overlay"></div>
              <div className="video-details">
                <div className="play-icon-wrapper">
                  <Play size={32} />
                </div>
                <h3 className="video-slide-title">{videos[currentIndex].title}</h3>
              </div>
            </motion.div>
          </AnimatePresence>

          <button onClick={prevSlide} className="carousel-nav prev">
            <ChevronLeft size={28} />
          </button>
          <button onClick={nextSlide} className="carousel-nav next">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedVideos;