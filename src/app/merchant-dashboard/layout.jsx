'use client';

import { useState, useEffect } from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import { Sidebar } from '@/components/merchant-dashboard/Sidebar';
import { Header } from '@/components/merchant-dashboard/Header';
import { motion } from 'framer-motion';
import styles from './Dashboard.module.css';

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // If switching to desktop view, ensure mobile menu is closed
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

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // On mobile, we want to close the sidebar when a nav item is clicked
  const handleNavigation = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(`.${styles.sidebar}`);
      const menuButton = document.querySelector(`.${styles.mobileMenuButton}`);
      
      if (sidebar && !sidebar.contains(event.target) && 
          menuButton && !menuButton.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (!isMounted) return;
    
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
  }, [isMobileMenuOpen, isMounted]);

  return (
    <DashboardProvider>
      <div 
        className={`${styles.dashboardLayout} ${isCollapsed ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
      >
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleSidebar}
          onNavigation={handleNavigation}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <Header 
          onMenuClick={toggleSidebar} 
          isCollapsed={isCollapsed} 
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <main className={`${styles.mainContent} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
          <div className={styles.mainInner}>
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}