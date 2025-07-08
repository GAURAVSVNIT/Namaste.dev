"use client"

import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../static/Navbar.css'
import Link from 'next/link';

export default function Navbar(fontFace) {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    // { name: 'Home'},
    { name: 'Social Media', route: "social" },
    { name: 'Market Place', route: "marketplace" },
    { name: 'Quiz', route: "quiz" },
    { name: 'Virtual Try-On', route: "virtual-tryon" },
    { name: 'Upload Look', route: "/" },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ` + fontFace}>
        <div className="navbar-container">
          <Link href="/" className="logo">
            <i className="fas fa-tshirt logo-icon"></i>
            FashionHub
          </Link>

          {isMobile ? (
            <>
              <button className="mobile-menu-btn" onClick={toggleMenu}>
                <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
              </button>

              <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
                <ul className="mobile-nav-links">
                  {navItems.map((item, index) => (
                    <li key={index} className="mobile-nav-item">
                      <Link href={`/${item.route.replace(/^\/+/, "")}`} className="mobile-nav-link">{item.name}</Link>
                    </li>
                  ))}
                </ul>
                <div className="mobile-auth-buttons">
                  <Link href="/auth/login" className="login-btn">Login</Link>
                  <Link href="/auth/signup" className="signup-btn">Sign Up</Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <ul className="nav-links">
                {navItems.map((item, index) => (
                  <li key={index} className="nav-item">
                    <Link href={`/${item.route.replace(/^\/+/, "")}`} className="nav-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="auth-buttons">
                <Link href="/auth/login" className="login-btn">Login</Link>
                <Link href="/auth/signup" className="signup-btn">Sign Up</Link>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
