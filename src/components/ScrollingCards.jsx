'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Heart, Package, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import '../static/ScrollingCards.css';

// Card data remains the same
const cardData = [
  {
    id: 1,
    title: 'Luxe Collection',
    subtitle: 'Premium Fashion',
    description: 'Discover our premium collection, crafted with the finest materials and attention to detail that speaks to your sophisticated taste.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format&q=80',
    color: '#c07e2d',
    href: '/marketplace?category=luxury'
  },
  {
    id: 2,
    title: 'Urban Explorer',
    subtitle: 'Street Fashion',
    description: 'Chic and comfortable, our urban collection is designed for the modern city dweller who values both style and functionality.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=800&fit=crop&auto=format&q=80',
    color: '#dde93f',
    href: '/marketplace?category=urban'
  },
  {
    id: 3,
    title: 'Summer Breeze',
    subtitle: 'Seasonal Trends',
    description: 'Light, airy, and effortlessly stylish. Get ready for the sunny days ahead with our breathable and vibrant collection.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop&auto=format&q=80',
    color: '#ff9f1c',
    href: '/marketplace?category=summer'
  },
  {
    id: 4,
    title: 'Elite Formal',
    subtitle: 'Business Collection',
    description: 'Sophisticated formal wear for the discerning professional. Make a statement at every business meeting and formal event.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&h=800&fit=crop&auto=format&q=80',
    color: '#2563eb',
    href: '/marketplace?category=formal'
  }
];

// Reusable Card Component
const Card = ({ card, index, progress }) => {
  const totalCards = cardData.length;
  
  // Each card gets 1/totalCards of the progress range
  const cardProgress = 1 / totalCards;
  const startProgress = index * cardProgress;
  const endProgress = (index + 1) * cardProgress;
  
  let x, scale;
  
  // Create comprehensive animation ranges that work smoothly in both directions
  if (index === 0) {
    // First card: starts visible, slides left on forward scroll, slides back from left on reverse
    x = useTransform(progress, 
      [0, cardProgress, 1], 
      ['0%', '-120%', '-120%'] // Stays out once it goes left
    );
    scale = useTransform(progress, 
      [0, cardProgress, 1], 
      [1, 0.8, 0.8]
    );
  } else {
    // All other cards: comprehensive bidirectional animation
    const prevProgress = Math.max(0, (index - 1) * cardProgress);
    const currentStart = index * cardProgress;
    const currentEnd = Math.min(1, (index + 1) * cardProgress);
    
    if (index === totalCards - 1) {
      // Last card: slides in from right, stays visible at end
      x = useTransform(progress, 
        [0, prevProgress, currentStart, 1], 
        ['120%', '120%', '0%', '0%'] // Comes from right and stays
      );
      scale = useTransform(progress, 
        [0, prevProgress, currentStart, 1], 
        [0.8, 0.8, 1, 1]
      );
    } else {
      // Middle cards: full cycle animation
      x = useTransform(progress, 
        [0, prevProgress, currentStart, currentEnd, 1], 
        ['120%', '120%', '0%', '-120%', '-120%']
      );
      scale = useTransform(progress, 
        [0, prevProgress, currentStart, currentEnd, 1], 
        [0.8, 0.8, 1, 0.8, 0.8]
      );
    }
  }

  return (
    <motion.div
      className={`card card-${index + 1}`}
      style={{
        zIndex: totalCards - index,
        x,
        scale,
      }}
    >
      <div className="card-image-container">
        <motion.img 
          src={card.image} 
          alt={card.title} 
          className="card-image"
          loading="lazy"
        />
        <div className="image-overlay" />
        <motion.div 
          className="category-badge"
          style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}
        >
          <Package className="w-4 h-4" />
          <span>{card.subtitle}</span>
        </motion.div>
      </div>
      <div className="card-content">
        <div className="content-inner">
          <h3 className="card-title" style={{ color: card.color }}>
            {card.title}
          </h3>
          <p className="card-description">{card.description}</p>
          <div className="card-actions">
            <Link href={card.href} passHref>
              <motion.button 
                className="explore-btn"
                style={{
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                  boxShadow: `0 8px 25px ${card.color}40`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <motion.button 
              className="wishlist-btn"
              whileHover={{ scale: 1.1, borderColor: card.color, color: card.color }}
              whileTap={{ scale: 0.9 }}
              style={{ color: `${card.color}99`, borderColor: `${card.color}40` }}
            >
              <Heart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const ScrollingCards = () => {
  const sectionRef = useRef(null);
  const scrollProgress = useMotionValue(0);
  const smoothProgress = useSpring(scrollProgress, { 
    stiffness: 150, 
    damping: 50, 
    mass: 1.2,
    restDelta: 0.001,
    restSpeed: 0.01
  });
  const [isFullyVisible, setIsFullyVisible] = useState(false);

  // Intersection Observer to check if carousel is visible
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Activate horizontal scroll when section is at least 60% visible for better UX
        setIsFullyVisible(entry.intersectionRatio >= 0.6);
      },
      {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], // Multiple thresholds for smooth detection
        rootMargin: '-10% 0px -10% 0px' // Add margin for better trigger area
      }
    );

    observer.observe(section);

    return () => {
      observer.unobserve(section);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Touch/swipe handling for mobile
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouching = false;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      isTouching = true;
    };

    const handleTouchMove = (e) => {
      if (!isTouching) return;
      
      // ULTRA STRICT: Always prevent default when carousel is visible
      if (!isFullyVisible) {
        return;
      }
      
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = touchStartY - touchY;
      const deltaX = Math.abs(touchStartX - touchX);
      
      // Only handle vertical swipes (ignore horizontal swipes)
      if (deltaX > Math.abs(deltaY) * 1.2) {
        e.preventDefault(); // Still block even horizontal-ish swipes near carousel
        return;
      }
      
      const currentProgress = scrollProgress.get();
      const scrollSensitivity = 0.004;
      const newProgress = currentProgress + deltaY * scrollSensitivity;
      
      // Determine scroll conditions
      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;
      
      // ULTRA STRICT CONDITIONS
      const isAtExactStart = currentProgress <= 0.001; // Almost zero tolerance
      const isAtExactEnd = currentProgress >= 0.999;   // Almost complete
      
      // Allow ONLY these very specific cases for page scrolling:
      const allowUpwardPageScroll = isAtExactStart && isScrollingUp;
      const allowDownwardPageScroll = isAtExactEnd && isScrollingDown;
      
      if (allowUpwardPageScroll || allowDownwardPageScroll) {
        // Allow page scroll only in these exact cases
        return;
      }
      
      // EVERYTHING ELSE: Block page scroll and handle with carousel
      e.preventDefault();
      e.stopPropagation(); // Extra blocking
      
      const clampedProgress = Math.max(0, Math.min(1, newProgress));
      scrollProgress.set(clampedProgress);
      touchStartY = touchY;
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    // Mouse wheel handling for desktop
    const handleWheel = (e) => {
      // ULTRA STRICT: Always prevent default when carousel is visible
      if (!isFullyVisible) return;
      
      const currentProgress = scrollProgress.get();
      const scrollDelta = e.deltaY;
      const scrollSensitivity = 0.002;
      const newProgress = currentProgress + scrollDelta * scrollSensitivity;
      
      // Determine scroll direction
      const isScrollingDown = scrollDelta > 0;
      const isScrollingUp = scrollDelta < 0;
      
      // ULTRA STRICT CONDITIONS - Same as touch
      const isAtExactStart = currentProgress <= 0.001; // Almost zero tolerance
      const isAtExactEnd = currentProgress >= 0.999;   // Almost complete
      
      // Allow ONLY these very specific cases for page scrolling:
      const allowUpwardPageScroll = isAtExactStart && isScrollingUp;
      const allowDownwardPageScroll = isAtExactEnd && isScrollingDown;
      
      if (allowUpwardPageScroll || allowDownwardPageScroll) {
        // Allow page scroll only in these exact cases
        return;
      }
      
      // EVERYTHING ELSE: Block page scroll and handle with carousel
      e.preventDefault();
      e.stopPropagation(); // Extra blocking
      
      const clampedProgress = Math.max(0, Math.min(1, newProgress));
      scrollProgress.set(clampedProgress);
    };

    // Add event listeners
    section.addEventListener('wheel', handleWheel, { passive: false });
    section.addEventListener('touchstart', handleTouchStart, { passive: false });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });
    section.addEventListener('touchend', handleTouchEnd);

    return () => {
      section.removeEventListener('wheel', handleWheel);
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
      section.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isFullyVisible]);
  

  return (
    <section className="scrolling-cards-section" ref={sectionRef}>
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-badge">
          <Sparkles className="w-5 h-5" />
          <span>Featured Collections</span>
        </div>
        <h2 className="section-title">
          Discover Your Style
          <span className="title-accent">Journey</span>
        </h2>
      </motion.div>

      <div className="cards-wrapper">
        {cardData.map((card, index) => (
          <Card card={card} index={index} key={card.id} progress={smoothProgress} />
        ))}
      </div>
    </section>
  );
};

export default ScrollingCards;