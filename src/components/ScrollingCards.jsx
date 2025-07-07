'use client';

import React, { useRef, useEffect, useState } from 'react';
import '../static/ScrollingCards.css';

const cardData = [
  {
    title: 'Luxe Collection',
    description: 'Discover our premium collection, crafted with the finest materials and attention to detail.',
    image: '/sc1.jpg'
  },
  {
    title: 'Urban Explorer',
    description: 'Chic and comfortable, our urban collection is designed for the modern city dweller.',
    image: '/sc2.jpg'
  },
  {
    title: 'Summer Breeze',
    description: 'Light, airy, and effortlessly stylish. Get ready for the sunny days ahead.',
    image: '/sc3.jpg'
  }
];

const ScrollingCards = () => {
  const containerRef = useRef(null);
  const [visibleCard, setVisibleCard] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const containerTop = container.offsetTop;

      const cardIndex = Math.floor((scrollPosition - containerTop) / (container.scrollHeight / cardData.length));
      setVisibleCard(Math.max(0, Math.min(cardData.length - 1, cardIndex)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scrolling-cards-container" ref={containerRef}>
      <div className="sticky-container">
        <div className="cards-wrapper">
          {cardData.map((card, index) => {
            const offset = index - visibleCard;
            const isActive = index === visibleCard;

            return (
              <div
                key={index}
                className={`card card-${index + 1} ${isActive ? 'visible' : ''}`}
                style={{
                  transform: `translateY(${offset * -5}vh) translateZ(${isActive ? 0 : -100 * Math.abs(offset)}px) scale(${1 - Math.abs(offset) * 0.05})`,
                  zIndex: isActive ? cardData.length : cardData.length - Math.abs(offset),
                  opacity: offset > 2 ? 0 : 1,
                }}
              >
                <div className="card-image-container">
                  <img src={card.image} alt={card.title} className="card-image" />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollingCards;
