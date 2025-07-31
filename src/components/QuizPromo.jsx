'use client';

import React, { useEffect, useRef, useState } from 'react';
import '../static/QuizPromo.css';

const QuizPromo = () => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className={`quiz-promo-container ${isVisible ? 'visible' : ''}`} ref={containerRef}>
      {/* New Side Stats */}
      <div className="side-stat left-stat">
        <span className="stat-number">25K+</span>
        <span className="stat-label">Quizzes Taken</span>
      </div>
      <div className="side-stat right-stat">
        <span className="stat-number">5K+</span>
        <span className="stat-label">Prizes Won</span>
      </div>

      <div 
        className="mouse-follower"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      ></div>

      <div className="bg-pattern pattern-1"></div>
      <div className="bg-pattern pattern-2"></div>
      <div className="bg-pattern pattern-3"></div>

      <div className="quiz-promo-content">
        <div className="title-container">
          <h2 className="quiz-promo-title">
            <span className="title-line">Take Our Quiz and Win</span>
            <span className="title-line highlight">Exciting Coupons</span>
            <span className="title-line">and Discounts!</span>
          </h2>
        </div>
        
        <p className="quiz-promo-description">
          Discover your unique fashion style and unlock exclusive rewards! 
          Take our personalized fashion quiz and get instant access to special discounts, 
          limited-time offers, and style recommendations tailored just for you.
        </p>

        <div className="quiz-features">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <span>Personalized Style</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🏷️</div>
            <span>Exclusive Discounts</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <span>Instant Results</span>
          </div>
        </div>
        
        <div className="cta-container">
          <a href="/quiz" className="quiz-cta-button">
            <span className="button-text">Start Quiz Now</span>
            <div className="button-shine"></div>
          </a>
          
          <div className="promo-timer">
            <span className="timer-text">Limited Time Offer!</span>
            <div className="timer-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPromo;