'use client';

import React from 'react';
import '../static/ServicesSection.css';

const ServicesSection = () => {
  return (
    <div className="services-container">
      <h2 className="services-title">Our Signature Services</h2>
      <p className="services-subtitle">
        We offer complementary styling on all orders, carefully curated 
        by our fashion experts and presented in elegant packaging.
      </p>
      
      <div className="services-grid">
        <div className="service-card">
          <div className="service-image">
            <img 
              src="/fs1.jpg" 
              alt="Personal Styling Services" 
            />
          </div>
          <div className="service-content">
            <h3 className="service-content-title">Personal Styling</h3>
            <div className="service-links">
              <a href="/consultation" className="service-link">Book Consultation</a>
            </div>
          </div>
        </div>

        <div className="service-card">
          <div className="service-image">
            <img 
              src="/fs2.jpg" 
              alt="Virtual Try-On" 
            />
          </div>
          <div className="service-content">
            <h3 className="service-content-title">Virtual Try-On</h3>
            <div className="service-links">
              <a href="/virtual-tryon" className="service-link">Try Now</a>
              <a href="/avatars" className="service-link">Create Avatar</a>
            </div>
          </div>
        </div>

        <div className="service-card">
          <div className="service-image">
            <img 
              src="/fs3.jpg" 
              alt="Join Fashion Network" 
            />
          </div>
          <div className="service-content">
            <h3 className="service-content-title">Join Fashion Network</h3>
            <div className="service-links">
              <a href="/social/fashiontv" className="service-link">Watch Live</a>
              <a href="/social" className="service-link">Join Community</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;