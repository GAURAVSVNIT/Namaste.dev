'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User
} from 'lucide-react';
import styles from './Sidebar.module.css';
import profileStyles from './ProfileSection.module.css';

// Icons for sidebar items
const menuItems = [
  { 
    icon: <LayoutDashboard size={18} />, 
    label: 'Dashboard', 
    href: '/merchant-dashboard' 
  },
  { 
    icon: <Package size={18} />, 
    label: 'Products', 
    href: '/merchant-dashboard/products' 
  },
  { 
    icon: <BarChart2 size={18} />, 
    label: 'Analytics', 
    href: '/merchant-dashboard/analytics' 
  },
  { 
    icon: <ShoppingBag size={18} />, 
    label: 'Orders', 
    href: '/merchant-dashboard/orders' 
  },
  { 
    icon: <Users size={18} />, 
    label: 'Chats', 
    href: '/merchant-dashboard/chat' 
  },
  { 
    icon: <Users size={18} />, 
    label: 'Payments', 
    href: '/merchant-dashboard/payments' 
  },
 
];

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function Sidebar({ isCollapsed, onToggleCollapse, onNavigation }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Close mobile menu when switching to desktop
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu and profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu if open and click is outside
      if (isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      
      // Close profile dropdown if open and click is outside
      if (isProfileOpen) {
        const profileButton = document.querySelector('.profileButton');
        if (profileButton && !profileButton.contains(event.target)) {
          setIsProfileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isProfileOpen]);

  const handleNavigation = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
    if (onNavigation) onNavigation();
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            className={styles.overlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 50,
              opacity: isMobileMenuOpen ? 1 : 0,
              visibility: isMobileMenuOpen ? 'visible' : 'hidden',
              transition: 'opacity 0.3s ease, visibility 0.3s ease',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile menu button */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 60,
          display: isMobile ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '0.375rem',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
        }}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.open : ''}`}
        ref={sidebarRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 55,
          transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          transition: 'transform 0.3s ease',
          display: 'block'
        }}
      >
        <div className={styles.sidebarContent}>
          {/* Logo */}
          <header className={styles.sidebarHeader}>
            {!isCollapsed && (
              <Link href="/merchant-dashboard" className={styles.logo}>
                <span className={styles.logoIcon}>
                  <LayoutDashboard size={18} />
                </span>
                <span>Merchant</span>
              </Link>
            )}
            <div className={styles.headerControls}>
              <button
                onClick={onToggleCollapse}
                className={styles.collapseButton}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>
              {/* <button
                onClick={() => {
                  if (isMobile) {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`${styles.closeButton} ${!isMobile ? styles.hidden : ''}`}
                aria-label="Close menu"
              >
                <X size={20} />
              </button> */}
            </div>
          </header>

          {/* Navigation */}
          <div className={styles.navContainer}>
            <nav className={styles.nav}>
              <ul>
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${
                        pathname.startsWith(item.href) ? styles.active : ''
                      }`}
                      onClick={handleNavigation}
                    >
                      <span className={styles.navIcon}>
                        {item.icon}
                      </span>
                      <span className={styles.navText}>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Profile Section */}
          <div className={`${profileStyles.profileSection} ${isProfileOpen ? profileStyles.active : ''}`}>
            <div className={profileStyles.profileContent}>
              <div className={profileStyles.profileButtonContainer}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(prev => !prev);
                  }}
                  className={`${profileStyles.profileButton} profileButton`}
                  aria-expanded={isProfileOpen}
                  aria-label="Profile menu"
                >
                  <div className={profileStyles.avatar}>
                    <User size={20} />
                  </div>
                  {!isCollapsed && (
                    <div className={profileStyles.profileInfo}>
                      <span className={profileStyles.profileName}>John Doe</span>
                      <span className={profileStyles.profileEmail}>john@example.com</span>
                    </div>
                  )}
                </button>
                
                {!isCollapsed && (
                  <ChevronDown 
                    size={16} 
                    className={`${profileStyles.chevron} ${isProfileOpen ? profileStyles.rotated : ''}`} 
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Sign Out Button - Shows to the right when profile is open */}
              <AnimatePresence>
                {isProfileOpen && !isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={profileStyles.signOutContainer}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle sign out
                        handleNavigation();
                        setIsProfileOpen(false);
                      }}
                      className={profileStyles.signOutButton}
                      aria-label="Sign out"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                    
                    <Link
                      href="/merchant-dashboard/settings"
                      className={profileStyles.settingsButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigation();
                        setIsProfileOpen(false);
                      }}
                      aria-label="Settings"
                    >
                      <Settings size={16} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}