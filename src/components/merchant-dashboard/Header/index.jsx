'use client';

import React, { useState } from 'react';
import { Bell, Search, Settings, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

export function Header({ onMenuClick, isCollapsed }) {
  const [hasNotifications] = useState(true);

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
            placeholder="Search products, orders, customers..."
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
            <span>JD</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}