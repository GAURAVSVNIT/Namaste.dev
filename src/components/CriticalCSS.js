'use client';

import { useEffect } from 'react';

const CriticalCSS = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'style';
    preloadLink.href = '/_next/static/css/critical.css';
    document.head.appendChild(preloadLink);

    // Load non-critical CSS asynchronously after page load
    const loadNonCriticalCSS = () => {
      const nonCriticalCSS = [
        '/static/QuizPromo.css',
        '/static/Onboarding.css',
        '/static/BrandCarousel.css',
        '/static/FeaturedVideos.css',
        '/static/TestimonialsSection.css',
        '/static/ServicesSection.css'
      ];

      nonCriticalCSS.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() {
          this.media = 'all';
        };
        document.head.appendChild(link);
      });
    };

    // Load non-critical CSS after initial render
    if (document.readyState === 'complete') {
      loadNonCriticalCSS();
    } else {
      window.addEventListener('load', loadNonCriticalCSS);
    }

    return () => {
      window.removeEventListener('load', loadNonCriticalCSS);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        /* Critical Above-the-fold CSS - Inlined for fastest FCP */
        
        /* Reset and base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        body {
          font-family: var(--font-geist-sans), 'Inter', system-ui, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }

        /* Critical Hero Section Styles */
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          text-align: center;
          color: white;
          z-index: 2;
          max-width: 1200px;
          padding: 2rem;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          font-family: var(--font-playfair-display), serif;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2vw, 1.5rem);
          margin-bottom: 2rem;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Critical Navigation Styles */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.1);
          padding: 1rem 0;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
        }

        .navbar-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          text-decoration: none;
        }

        .navbar-nav {
          display: flex;
          list-style: none;
          gap: 2rem;
        }

        .navbar-nav a {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .navbar-nav a:hover {
          color: #667eea;
        }

        /* Critical Loading States */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Critical Button Styles */
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        /* Hide scrollbars */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }

        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .navbar-nav {
            display: none;
          }
          
          .hero-content {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default CriticalCSS;
