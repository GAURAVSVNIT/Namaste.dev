'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, DollarSign, Package, TrendingUp, MessageSquare, Users, Calendar, Star } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { auth } from '@/lib/firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import styles from '../merchant-dashboard/Dashboard.module.css';

// Mock functions for dashboard data
const getFashionCreatorDashboardSummary = async (userId) => {
  return {
    todayRevenue: 1850.75,
    activeOrders: 8,
    totalCustomers: 32,
    unreadMessages: 2,
    recentOrders: []
  };
};

const getTopSellingServices = async (limit) => {
  return [
    { id: 1, name: 'Wedding Suits', orders: 25 },
    { id: 2, name: 'Casual Wear', orders: 18 },
    { id: 3, name: 'Party Dresses', orders: 15 },
    { id: 4, name: 'Business Attire', orders: 12 },
    { id: 5, name: 'Traditional Wear', orders: 10 }
  ];
};

const subscribeToDashboardUpdates = (userId, callback) => {
  // Mock subscription - returns unsubscribe function
  const interval = setInterval(() => {
    callback({
      todayRevenue: 1850.75 + Math.random() * 100,
      activeOrders: 8 + Math.floor(Math.random() * 5),
      totalCustomers: 32,
      unreadMessages: Math.floor(Math.random() * 8)
    });
  }, 30000); // Update every 30 seconds
  
  return () => clearInterval(interval);
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

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

function FashionCreatorDashboardContent() {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    activeOrders: 0,
    totalCustomers: 0,
    unreadMessages: 0,
    recentOrders: [],
    todayStats: {}
  });
  const [topServices, setTopServices] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        // Fetch initial dashboard summary
        try {
          const summary = await getFashionCreatorDashboardSummary(user.uid);
          setDashboardData(prev => ({ ...prev, ...summary }));
          
          // Fetch top selling services
          const services = await getTopSellingServices(5);
          setTopServices(services);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setLoading(false);
        }
        
        // Subscribe to real-time updates
        const unsubscribeDashboard = subscribeToDashboardUpdates(user.uid, (updates) => {
          setDashboardData(prev => ({ ...prev, ...updates }));
        });
        
        return () => {
          unsubscribeDashboard();
        };
      }
    });
    
    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Calculate stats based on real data
  const stats = [
    {
      title: 'Today\'s Revenue',
      value: `$${dashboardData.todayRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      trend: 'up',
      trendValue: 12.5,
      color: 'green'
    },
    {
      title: 'Active Orders',
      value: dashboardData.activeOrders?.toString() || '0',
      icon: Package,
      trend: 'up',
      trendValue: 8.2,
      color: 'blue'
    },
    {
      title: 'Total Customers',
      value: dashboardData.totalCustomers?.toString() || '0',
      icon: Users,
      trend: 'up',
      trendValue: 3.1,
      color: 'purple'
    },
    {
      title: 'New Messages',
      value: dashboardData.unreadMessages?.toString() || '0',
      icon: MessageSquare,
      trend: dashboardData.unreadMessages > 0 ? 'up' : 'down',
      trendValue: 2.4,
      color: 'orange'
    }
  ];

  // Chart data
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [800, 1200, 1000, 1400, 1600, 1100, 1300],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  };

  const categoryChartData = {
    labels: ['Wedding Suits', 'Casual Wear', 'Party Dresses', 'Business Attire', 'Traditional'],
    datasets: [
      {
        label: 'Orders by Category',
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(147, 51, 234, 0.9)',
          'rgba(107, 114, 128, 0.9)',
        ],
        borderWidth: 0,
        offset: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        titleFont: {
          weight: '600',
          size: 12,
        },
        bodyFont: {
          weight: '500',
          size: 13,
        },
        padding: 12,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Reusable card component for consistent styling
  const Card = ({ children, className = '', ...props }) => (
    <div className={`${styles.card} ${className}`} {...props}>
      {children}
    </div>
  );

  // Card header component
  const CardHeader = ({ title, action, className = '' }) => (
    <div className={`${styles.cardHeader} ${className}`}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );

  // Card content component
  const CardContent = ({ children, className = '', noPadding = false }) => (
    <div className={`${!noPadding ? styles.cardContent : ''} ${className}`}>
      {children}
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Fashion Creator! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Here's what's happening with your fashion business today.
              </p>
            </div>
            <div className="relative">
              <select className="appearance-none px-4 py-2 pr-8 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="h-full"
          >
            <Card>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div>
                    <p className={styles.statTitle}>
                      {stat.title}
                    </p>
                    <h3 className={styles.statValue}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${styles.statIcon} ${styles[`bg${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}50`]} ${styles[`text${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}600`]}`}>
                    <stat.icon className={styles.statIconSvg} />
                  </div>
                </div>
                <div className={styles.statTrend}>
                  <span className={`${styles.trendValue} ${stat.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                    {stat.trend === 'up' ? (
                      <svg className={styles.trendIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className={styles.trendIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                      </svg>
                    )}
                    {stat.trendValue}% from last week
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 h-full"
        >
          <Card>
            <CardHeader 
              title="Revenue Overview"
              action={
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp size={16} className="text-green-500" />
                  <span>+12.5% from last week</span>
                </div>
              }
            />
            <CardContent>
              <div className="h-64 -mx-1">
                <Line data={salesChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="h-full"
        >
          <Card>
            <CardHeader title="Orders by Category" />
            <CardContent>
              <div className="h-56 flex items-center justify-center mt-2 -mx-2">
                <Doughnut data={categoryChartData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'right',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 8,
                        color: '#4B5563',
                        font: {
                          size: 12
                        }
                      }
                    }
                  },
                  cutout: '70%',
                  radius: '90%'
                }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader title="Recent Activity" />
          <CardContent>
            <div className={styles.activityList}>
              {[
                { 
                  icon: Scissors, 
                  text: 'New custom suit order received', 
                  time: '5 minutes ago', 
                  color: 'blue',
                  status: 'New'
                },
                { 
                  icon: Users, 
                  text: 'Customer measurement scheduled', 
                  time: '15 minutes ago', 
                  color: 'green',
                  status: 'Scheduled'
                },
                { 
                  icon: Package, 
                  text: 'Wedding dress "Elegant Grace" completed', 
                  time: '1 hour ago', 
                  color: 'purple',
                  status: 'Completed'
                },
                { 
                  icon: MessageSquare, 
                  text: 'New message from customer about alterations', 
                  time: '2 hours ago', 
                  color: 'orange',
                  status: 'Message'
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className={styles.activityItem}
                >
                  <div className={`${styles.activityIcon} ${styles[`bg${activity.color.charAt(0).toUpperCase() + activity.color.slice(1)}50`]} ${styles[`text${activity.color.charAt(0).toUpperCase() + activity.color.slice(1)}600`]}`}>
                    <activity.icon size={18} />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      {activity.text}
                    </p>
                    <p className={styles.activityTime}>
                      {activity.time}
                    </p>
                  </div>
                  <div className={styles.activityBadgeContainer}>
                    <span className={`${styles.activityBadge} ${styles[`status${activity.status}`]}`}>
                      {activity.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className={styles.viewAllContainer}>
              <button className={styles.viewAllButton}>
                <span>View all activity</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main component with role protection
export default function FashionCreatorDashboardPage() {
  return (
    <FashionCreatorDashboardContent />
  );
}
