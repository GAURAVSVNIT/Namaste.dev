'use client';
import React from 'react';
import '../static/Hero.css';

const Hero = () => {

  return (
    <div className="hero-container">
      <div className="hero-text">
        <h1>Where Style Comes to Life</h1>
        <p>Discover the latest trends and express your unique style with our curated collection of fashion.</p>
        
        <div className="cta-container">
          <a href="/marketplace" className="cta-button">
            <ShoppingCart /> 
            Shop Now  
          </a>
          <a href="/quiz" className="cta-button-outlined">Test your fashion</a>
        </div>

      </div>

      <div className="hero-images">
        <img 
          src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop" 
          alt="Fashion 1" 
          className="hero-image image-1" 
        />
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop" 
          alt="Fashion 2" 
          className="hero-image image-2" 
        />
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" 
          alt="Fashion 3" 
          className="hero-image image-3" 
        />
      </div>
    </div>
  );
};

const ShoppingCart = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6h15l-1.5 9h-13L4 4H1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="20" r="1" fill="#ffffff"/>
      <circle cx="18" cy="20" r="1" fill="#ffffff"/>
    </svg>
  )
}

export default Hero;