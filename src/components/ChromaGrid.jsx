'use client';

import { useState, useEffect } from 'react';
import AnimatedContent from '@/blocks/Animations/AnimatedContent/AnimatedContent';

const ChromaGrid = ({ children, columns = 3, gap = '24px', className = '' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Convert children to array if it's not already
  const childrenArray = Array.isArray(children) ? children : [children];

  // Chroma colors for dynamic backgrounds
  const chromaColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  ];

  return (
    <div 
      className={className}
      style={{
        position: 'relative',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(248,250,252,0.1) 100%)',
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: chromaColors[i % chromaColors.length],
              borderRadius: '50%',
              opacity: 0.1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01 * (i + 1)}px, ${mousePosition.y * 0.01 * (i + 1)}px)`,
              transition: 'transform 0.3s ease-out',
              animation: `float ${3 + i}s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Grid container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${columns === 1 ? '100%' : columns === 2 ? '300px' : '280px'}, 1fr))`,
        gap,
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {childrenArray.map((child, index) => (
          <AnimatedContent
            key={index}
            distance={80}
            direction="vertical"
            duration={0.6}
            delay={index * 0.1}
            threshold={0.2}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: hoveredIndex === index 
                  ? '2px solid rgba(102, 126, 234, 0.4)' 
                  : '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: hoveredIndex === index
                  ? '0 25px 50px -12px rgba(102, 126, 234, 0.25), 0 0 0 1px rgba(102, 126, 234, 0.1)'
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredIndex === index 
                  ? 'translateY(-8px) scale(1.02)' 
                  : 'translateY(0) scale(1)',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Chroma border effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: chromaColors[index % chromaColors.length],
                opacity: hoveredIndex === index ? 0.15 : 0.05,
                transition: 'opacity 0.3s ease',
                borderRadius: '20px',
                pointerEvents: 'none'
              }} />
              
              {/* Content */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                height: '100%'
              }}>
                {child}
              </div>
            </div>
          </AnimatedContent>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default ChromaGrid;
