'use client';

import React, { useRef, useEffect } from 'react';
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
  const lastCardIndex = totalCards - 1;

  // For all cards except the last one, they slide in and then slide out.
  // The last card slides in and stays.
  const input = [
    (index - 1) / totalCards, 
    index / totalCards, 
    (index + 1) / totalCards
  ];
  
  const output = index === lastCardIndex 
    ? ['110%', '0%', '0%'] // Last card stays
    : ['110%', '0%', '-110%']; // Others slide out

  const x = useTransform(progress, input, output);
  const scale = useTransform(progress, input, [0.95, 1, 0.95]);

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
  const smoothProgress = useSpring(scrollProgress, { stiffness: 120, damping: 40 });

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
      
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = touchStartY - touchY;
      const deltaX = Math.abs(touchStartX - touchX);
      
      // Only handle vertical swipes (ignore horizontal swipes)
      if (deltaX > Math.abs(deltaY)) return;
      
      const currentProgress = scrollProgress.get();
      const scrollSensitivity = 0.002;
      const newProgress = currentProgress + deltaY * scrollSensitivity;
      
      const isInHorizontalRange = currentProgress > 0 && currentProgress < 1;
      const isAtStartAndScrollingDown = currentProgress === 0 && deltaY > 0;
      const isAtEndAndScrollingUp = currentProgress === 1 && deltaY < 0;
      
      if (isInHorizontalRange || isAtStartAndScrollingDown || isAtEndAndScrollingUp) {
        e.preventDefault();
        scrollProgress.set(Math.max(0, Math.min(1, newProgress)));
        touchStartY = touchY; // Update touch start for continuous scrolling
      }
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    // Mouse wheel handling for desktop
    const handleWheel = (e) => {
      const currentProgress = scrollProgress.get();
      const scrollDelta = e.deltaY;
      const scrollSensitivity = 0.0007;
      const newProgress = currentProgress + scrollDelta * scrollSensitivity;
      
      // Only prevent default if:
      // 1. We're currently in the middle of horizontal animation (0 < progress < 1)
      // 2. OR we're at the boundaries and scrolling would continue the horizontal animation
      const isInHorizontalRange = currentProgress > 0 && currentProgress < 1;
      const isAtStartAndScrollingDown = currentProgress === 0 && scrollDelta > 0;
      const isAtEndAndScrollingUp = currentProgress === 1 && scrollDelta < 0;
      
      if (isInHorizontalRange || isAtStartAndScrollingDown || isAtEndAndScrollingUp) {
        e.preventDefault();
        scrollProgress.set(Math.max(0, Math.min(1, newProgress)));
      }
      // Allow normal vertical scrolling when at boundaries and scrolling away from horizontal range
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
  }, [scrollProgress]);
  

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
        <p className="section-description">
          Scroll to explore our carefully curated collections designed to match every mood, occasion, and personal style.
        </p>
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