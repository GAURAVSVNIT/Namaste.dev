'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './StatsGrid.module.css';

export default function StatsGrid({ statsData }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={styles.statsGrid}
    >
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div 
            key={index} 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className={styles.statCardContent}>
              <div className={styles.statCardHeader}>
                <div className={styles.statTitle}>{stat.title}</div>
                <div className={styles.statIcon} style={{ color: stat.color }}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statChange}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" style={{ color: '#10b981', marginRight: '4px' }} />
                ) : (
                  <ArrowDownRight className="w-4 h-4" style={{ color: '#ef4444', marginRight: '4px' }} />
                )}
                <span style={{ color: stat.trend === 'up' ? '#10b981' : '#ef4444' }}>
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
