'use client';

import React, { useState } from 'react';
import { Bell, Search, Settings, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRole } from '@/hooks/useRole';
import styles from './Header.module.css';

// Helper function to get user initials
const getUserInitials = (user) => {
  if (!user) return 'U';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  }
  
  if (user.email) {
    const [localPart] = user.email.split('@');
    const parts = localPart.split('.');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return localPart.slice(0, 2).toUpperCase();
  }
  
  return 'U';
};

function Header({ onMenuClick, isCollapsed }) {
  const [hasNotifications] = useState(true);
  const { user, loading } = useRole();

  return (
    <header className={`${styles.header} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.headerContent}>
        <button 
          className={styles.mobileMenuButton}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search orders, customers, designs..."
          />
        </div>

        <div className={styles.actions}>
          <motion.button 
            className={styles.actionButton} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {hasNotifications && <span className={styles.notificationBadge}></span>}
          </motion.button>
          
          <motion.button 
            className={styles.actionButton} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            aria-label="Settings"
          >
            <Settings size={20} />
          </motion.button>
          
          <motion.div 
            className={styles.userAvatar} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            aria-label="User menu"
          >
            <span>{loading ? 'U' : getUserInitials(user)}</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

export default Header;
