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
              <a href="#" className="service-link">Book Consultation</a>
            </div>
          </div>
        </div>

        <div className="service-card">
          <div className="service-image">
            <img 
              src="/fs2.jpg" 
              alt="Custom Tailoring" 
            />
          </div>
          <div className="service-content">
            <h3 className="service-content-title">Custom Tailoring</h3>
            <div className="service-links">
              <a href="#" className="service-link">For Women</a>
              <a href="#" className="service-link">For Men</a>
            </div>
          </div>
        </div>

        <div className="service-card">
          <div className="service-image">
            <img 
              src="/fs3.jpg" 
              alt="Become Partners" 
            />
          </div>
          <div className="service-content">
            <h3 className="service-content-title">Become a Partner</h3>
            <div className="service-links">
              <a href="#" className="service-link">Explore Services</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;