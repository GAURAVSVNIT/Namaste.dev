'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import FashionCreatorSidebar from '@/components/fashion-creator-dashboard/Sidebar';
import FashionCreatorHeader from '@/components/fashion-creator-dashboard/Header';
import styles from './FashionCreatorDashboard.module.css';

export default function FashionCreatorDashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user] = useAuthState(auth);

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
    <RoleProtected allowedRoles={[USER_ROLES.FASHION_CREATOR, USER_ROLES.ADMIN]}>
      <div 
        className={`${styles.dashboardLayout} ${isCollapsed ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
      >
        <FashionCreatorSidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleSidebar}
          onNavigation={handleNavigation}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <FashionCreatorHeader 
          onMenuClick={toggleSidebar} 
          isCollapsed={isCollapsed} 
          isMobileMenuOpen={isMobileMenuOpen}
          user={user}
        />
        
        <main className={`${styles.mainContent} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
          <div className={styles.mainInner}>
            {children}
          </div>
        </main>
      </div>
    </RoleProtected>
  );
}
