'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  Package, 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Star,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Menu,
  ChevronDown,
  MessageSquare,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import styles from './FashionCreatorDashboard.module.css';

const statsData = [
  {
    title: 'Active Orders',
    value: '12',
    change: '+2 from yesterday',
    trend: 'up',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    title: 'Pending Measurements',
    value: '5',
    change: '-1 from yesterday',
    trend: 'down',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    title: 'This Week Revenue',
    value: '$2,840',
    change: '+12% from last week',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    title: 'Customer Rating',
    value: '4.8',
    change: '+0.2 this month',
    trend: 'up',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Rajesh Kumar',
    item: 'Wedding Suit',
    status: 'completed',
    dueDate: '2024-01-20',
    amount: '$450',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'ORD-002',
    customer: 'Priya Sharma',
    item: 'Party Dress',
    status: 'in-progress',
    dueDate: '2024-01-25',
    amount: '$280',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'ORD-003',
    customer: 'Amit Patel',
    item: 'Business Blazer',
    status: 'measurement',
    dueDate: '2024-01-30',
    amount: '$320',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Johnson',
    item: 'Casual Shirts (3)',
    status: 'pending',
    dueDate: '2024-02-05',
    amount: '$180',
    avatar: '/api/placeholder/32/32'
  }
];

const upcomingAppointments = [
  {
    time: '10:00 AM',
    customer: 'John Doe',
    type: 'Measurement',
    duration: '30 min'
  },
  {
    time: '2:30 PM',
    customer: 'Lisa Chen',
    type: 'Fitting',
    duration: '45 min'
  },
  {
    time: '4:00 PM',
    customer: 'Mike Wilson',
    type: 'Consultation',
    duration: '20 min'
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'measurement':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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

export default function TailorDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    const timeUpdate = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeUpdate);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    // <div className={styles.dashboardLayout}>
      <div className={styles.mainContent}>
        <div className={styles.mainInner}>
          <div className={styles.dashboardContainer}>
            {/* Welcome Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${styles.card} ${styles.welcomeCard}`}
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
            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={styles.statsGrid}
            >
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={styles.statCard}>
                    <div className={styles.statCardContent}>
                      <div className={styles.statCardHeader}>
                        <div className={styles.statTitle}>{stat.title}</div>
                        <div className={styles.statIcon}>
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
                  </div>
                );
              })}
            </motion.div>

            <div className={styles.contentGrid}>
              {/* Recent Orders */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={styles.contentGridMain}
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
                      {recentOrders.map((order) => (
                        <Link 
                          href={`/orders/${order.id}`} 
                          key={order.id} 
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

              {/* Today's Schedule & Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={styles.contentGridSidebar}
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
                        <div 
                          key={index} 
                          className={styles.activityItem}
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
                        </div>
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
            </div>
          </div>
        </div>
      </div>
    // </div>
  );
}
