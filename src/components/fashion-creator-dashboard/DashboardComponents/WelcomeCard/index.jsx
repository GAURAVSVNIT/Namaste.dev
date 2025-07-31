'use client';

import { motion } from 'framer-motion';
import { Plus, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './WelcomeCard.module.css';

export default function WelcomeCard({ currentTime }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.welcomeCard}
    >
      <div className={styles.welcomeHeader}>
        <div className={styles.cardContent}>
          {/* Decorative elements */}
          <div className={styles.decorativeCircle1}></div>
          <div className={styles.decorativeCircle2}></div>
          
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeText}>
              <h1>Welcome back, Fashion Creator! 👋</h1>
              <p>Here's what's happening with your business today.</p>
              
              {/* Quick Actions */}
              <div className={styles.quickActions}>
                <Button 
                  variant="outline" 
                  className={styles.quickActionButton}
                >
                  <Plus className={styles.buttonIcon} />
                  New Order
                </Button>
                <Button 
                  variant="outline" 
                  className={`${styles.quickActionButton} ${styles.secondaryAction}`}
                >
                  <Calendar className={styles.buttonIcon} />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
          
          {/* Date and Stats Card */}
          <div className={styles.dateCard}>
            <p>Today is {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
            <p className={styles.dateText}>
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <div className={styles.timeDisplay}>
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>Appointments</span>
                <span style={{ fontWeight: '500' }}>3</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', marginTop: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>Orders Due</span>
                <span style={{ fontWeight: '500' }}>2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
