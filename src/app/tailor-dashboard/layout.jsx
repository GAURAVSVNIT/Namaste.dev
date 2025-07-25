'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import TailorSidebar from '@/components/tailor-dashboard/Sidebar';
import TailorHeader from '@/components/tailor-dashboard/Header';
import styles from './TailorDashboard.module.css';

export default function TailorDashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <RoleProtected allowedRoles={[USER_ROLES.TAILOR, USER_ROLES.ADMIN]}>
      <div className={`${styles.dashboardLayout} ${isCollapsed ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <TailorSidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleSidebar}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <TailorHeader 
          onMenuClick={toggleSidebar} 
          isCollapsed={isCollapsed}
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
