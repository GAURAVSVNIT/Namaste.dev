'use client';

import React from 'react';
import '../static/BrandCarousel.css';

const brands = [
  { name: 'Vercel', logo: '/1.jpg' },
  { name: 'Next.js', logo: '/2.jpg' },
  { name: 'Globe', logo: '/3.jpg' },
  { name: 'Window', logo: '/4.jpg' },
  { name: 'File', logo: '/5.jpg' },
];

const BrandCarousel = () => {
  return (
    <div className="brand-carousel-container">
      <h2 className="brand-carousel-title">TOP BRANDS</h2>
      <div className="brand-carousel-track">
        {brands.map((brand, index) => (
          <div key={index} className="brand-logo">
            <img src={brand.logo} alt={brand.name} />
          </div>
        ))}
        {/* Duplicate for seamless scroll */}
        {brands.map((brand, index) => (
          <div key={`clone-${index}`} className="brand-logo">
            <img src={brand.logo} alt={brand.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCarousel;
