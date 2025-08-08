'use client';

import React from 'react';
import Image from 'next/image';
import '../static/BrandCarousel.css';

const brands = [
  { name: 'Adidas', logo: '/brands/1.jpg', logoClass: 'mix-blend-multiply mt-3 hover:scale-105' },
  { name: 'LouisVitton', logo: '/brands/2.png', logoClass: 'scale-150 scaleUpLV' },
  { name: 'H&M', logo: '/brands/3.png', logoClass: 'hover:scale-105' },
  { name: 'Prada', logo: '/brands/4.jpg', logoClass: 'mix-blend-multiply scale-116 scaleUpPrada' },
  { name: 'RalphLauren', logo: '/brands/5.png', logoClass: 'brightness-0 invert-0 hover:scale-105' },
  { name: 'Zara', logo: '/brands/6.png', logoClass: 'hover:scale-105' },
  { name: 'AllenSolly', logo: '/brands/7.webp', logoClass: 'hover:scale-105' },
];

const BrandCarousel = () => {
  return (
    <div className="brand-carousel-container">
      <h2 className="brand-carousel-title">TOP BRANDS</h2>
      <div className="brand-carousel-track">
        {brands.map((brand, index) => (
          <div key={index} className="brand-logo">
            <Image src={brand.logo} alt={brand.name} width={132} height={132} className={brand.logoClass ? brand.logoClass : ''} />
          </div>
        ))}
        {/* Duplicate for seamless scroll */}
        {brands.map((brand, index) => (
          <div key={`clone-${index}`} className="brand-logo">
            <img src={brand.logo} alt={brand.name} className={brand.logoClass ? brand.logoClass : ''} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCarousel;