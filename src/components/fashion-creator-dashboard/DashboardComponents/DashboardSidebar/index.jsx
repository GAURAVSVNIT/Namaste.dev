'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Calendar, Eye, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import styles from './DashboardSidebar.module.css';

export default function DashboardSidebar({ upcomingAppointments }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={styles.sidebarContainer}
    >
      {/* Today's Schedule */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Upcoming Appointments</h3>
          <p className={styles.cardDescription}>Your schedule for today</p>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.activityList}>
            {upcomingAppointments.map((appointment, index) => (
              <motion.div 
                key={index} 
                className={styles.activityItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className={styles.activityItemContent}>
                  <div className={styles.activityItemLeft}>
                    <div className={styles.activityIcon}>
                      <Calendar className={styles.iconSize} />
                    </div>
                    <div className={styles.activityInfo}>
                      <p className={styles.activityTitle}>{appointment.customer}</p>
                      <p className={styles.activitySubtitle}>{appointment.type} • {appointment.duration}</p>
                    </div>
                  </div>
                  <div className={styles.activityItemRight}>
                    <span className={styles.activityTime}>{appointment.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <Button variant="ghost" className={styles.cardFooterButton}>
              View Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Quick Actions</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.buttonGroup}>
            <Button className={styles.quickActionButton} variant="default">
              <Plus className={styles.quickActionIcon} />
              Add New Order
            </Button>
            <Button className={styles.quickActionButton} variant="outline">
              <Calendar className={styles.quickActionIcon} />
              Schedule Measurement
            </Button>
            <Button className={styles.quickActionButton} variant="outline" asChild>
              <Link href="/tailor-dashboard/portfolio">
                <Eye className={styles.quickActionIcon} />
                Manage Portfolio
              </Link>
            </Button>
            <Button className={styles.quickActionButton} variant="outline">
              <TrendingUp className={styles.quickActionIcon} />
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Monthly Progress</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.progressSection}>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span>Orders Completed</span>
                <span>24/30</span>
              </div>
              <Progress value={80} className={styles.progressBar} />
            </div>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span>Revenue Goal</span>
                <span>$8,400/$10,000</span>
              </div>
              <Progress value={84} className={styles.progressBar} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
