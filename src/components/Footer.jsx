"use client"

import React, { useState, useEffect } from 'react';
import '../static/Footer.css';
import { useRouter } from 'next/navigation';
import { FaInstagram, FaTwitter, FaLinkedin, FaTshirt, FaCamera, FaUserGraduate } from 'react-icons/fa';

const Footer = (fontFace) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className={"footer-glass " + fontFace}>
      {isClient && (
        <div className="footer-wrapper">
          <div className="footer-grid">

          <div className="footer-section floating">
            <h3>Shop</h3>
            <ul>
              <li><a href="/marketplace">Trendy Collections</a></li>
              <li><a href="/virtual-tryon">AR Wardrobe</a></li>
              <li><a href="/virtual-tryon/gallery">Style Showcase</a></li>
            </ul>
          </div>

          <div className="footer-section floating">
            <h3>Create</h3>
            <ul>
              <li><a href="/avatars">Avatar Studio</a></li>
              <li><a href="/social/looks">Style Discovery</a></li>
              <li><a href="/social">Community Hub</a></li>
            </ul>
          </div>

          <div className="footer-section floating">
            <h3>Watch</h3>
            <ul>
              <li><a href="/social/fashiontv">Fashion Network</a></li>
              <li><a href="/social/fashiontv/live">Live Runway</a></li>
              <li><a href="/social/trending">What's Hot</a></li>
            </ul>
          </div>

          <div className="footer-section floating">
            <h3>Learn</h3>
            <ul>
              <li><a href="/quiz">Style Challenges</a></li>
              <li><a href="/blog">Fashion Insights</a></li>
              <li><a href="/consultation">Style Advisor</a></li>
            </ul>
          </div>

          <div className="footer-cta">
            <button className="cta-button-footer" onClick={() => window.location.href = '/social/look/upload'}><FaCamera /> Upload Your Look</button>
            <button className="cta-button-footer secondary"><FaUserGraduate /> Join the Community</button>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="social-icons">
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
          <p>&copy; 2025 Fashion Hub. All rights reserved.</p>
        </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
