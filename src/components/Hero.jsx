'use client';
import React from 'react';
import '../static/Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-text">
        <h1>Where Style Comes to Life</h1>
        <p>Discover the latest trends and express your unique style with our curated collection of fashion.</p>
        {/* <div className="cta-container">
          <a href="/" className="cta-button">Shop Now</a>
          <a href="/social" className="cta-button cta-button--up">Post Your Outfit !</a>
          <a href="/deals" className="cta-button">Deals !</a>
          <a href="/marketplace" className="cta-button cta-button--up">Marketplace</a>
          <a href="/social" className="cta-button">Social Media</a>
          <a href="/quiz" className="cta-button cta-button--up">Test Fashion!</a>
        </div> */}

        <div className="cta-container">
          <a href="/marketplace" className="cta-button"> <ShoppingCart /> Shop Now  </a>
          <a href="/marketplace" className="cta-button-outlined">Test your fashion</a>
        </div>
      </div>
      <div className="hero-images">
        <img src="#" alt="Fashion 1" className="hero-image image-1" />
        <img src="#" alt="Fashion 2" className="hero-image image-2" />
        <img src="#" alt="Fashion 3" className="hero-image image-3" />
      </div>
    </div>
  );
};

const ShoppingCart = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6h15l-1.5 9h-13L4 4H1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="20" r="1" fill="#ffffff"/>
      <circle cx="18" cy="20" r="1" fill="#ffffff"/>
    </svg>
  )
}

export default Hero;
