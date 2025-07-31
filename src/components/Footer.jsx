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
            <h3>Marketplace</h3>
            <ul>
              <li><a href="#">Shop Trends</a></li>
              <li><a href="#">Student Designers</a></li>
              <li><a href="#">Sell Your Style</a></li>
            </ul>
          </div>

          <div className="footer-section floating">
            <h3>Social Feed</h3>
            <ul>
              <li><a href="#">Explore Posts</a></li>
              <li><a href="#">Trending Looks</a></li>
              <li><a href="#">Fashion Battles</a></li>
            </ul>
          </div>

          <div className="footer-section floating">
            <h3>Virtual Try-On</h3>
            <ul>
              <li><a href="#">Try 3D Outfits</a></li>
              <li><a href="#">My Virtual Closet</a></li>
              <li className=''><a href="#">Style Generator</a></li>
            </ul>
          </div>

          <div className="footer-section floating">
            <h3>Portfolios</h3>
            <ul>
              <li><a href="#">Browse Talent</a></li>
              <li><a href="#">Submit Portfolio</a></li>
              <li><a href="#">Get Noticed</a></li>
            </ul>
          </div>

          <div className="footer-cta">
            <button className="cta-button-footer"><FaCamera /> Upload Your Look</button>
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
