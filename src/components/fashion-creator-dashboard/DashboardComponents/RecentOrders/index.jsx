'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import styles from './RecentOrders.module.css';

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'in-progress':
      return <Clock className="w-4 h-4" />;
    case 'measurement':
      return <Users className="w-4 h-4" />;
    case 'pending':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function RecentOrders({ recentOrders }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={styles.container}
    >
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderContent}>
            <div>
              <h3 className={styles.cardTitle}>Recent Orders</h3>
              <p className={styles.cardDescription}>Your most recent customer orders</p>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View All
            </Button>
          </div>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.activityList}>
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <Link 
                  href={`/orders/${order.id}`} 
                  className={styles.activityItem}
                >
                  <div className={styles.activityItemContent}>
                    <div className={styles.activityItemLeft}>
                      <Avatar className="border">
                        <AvatarImage src={order.avatar} alt={order.customer} />
                        <AvatarFallback className="bg-gray-100">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>{order.customer}</p>
                        <p className={styles.activitySubtitle}>{order.item}</p>
                      </div>
                    </div>
                    <div className={styles.activityItemRight}>
                      <p className={styles.activityAmount}>{order.amount}</p>
                      <div className={styles.activityStatus}>
                        <span className={`${styles.statusBadge} ${styles[`status${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', '')}`]}`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50">
              View All Orders
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
