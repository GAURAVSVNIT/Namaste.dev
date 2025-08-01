'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Package, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { auth } from '@/lib/firebase';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getAnalyticsData, subscribeToAnalyticsUpdates, getMerchantDashboardSummary } from '@/lib/analytics';
import styles from './Dashboard.module.css';

function MerchantDashboardContent() {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    unreadMessages: 0,
    recentOrders: [],
    todayStats: {}
  });
  const [realtimeStats, setRealtimeStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        // Fetch initial dashboard summary
        try {
          const summary = await getMerchantDashboardSummary();
          console.log('Dashboard summary received:', summary); // Debug log
          setDashboardData(prev => ({ ...prev, ...summary }));
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setLoading(false);
        }
        
        // Subscribe to real-time updates
        const unsubscribeDashboard = subscribeToAnalyticsUpdates((updates) => {
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
      title: "Total Sales",
      value: `₹${(dashboardData?.summary?.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: 'up',
      color: 'green'
    },
    {
      title: "Total Orders",
      value: (dashboardData?.summary?.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      trend: 'up',
      color: 'blue'
    },
    {
      title: "Average Order Value",
      value: `₹${(dashboardData?.summary?.averageOrderValue || 0).toFixed(2)}`,
      icon: Package,
      trend: 'up',
      color: 'purple'
    },
    {
      title: "Conversion Rate",
      value: `${(dashboardData?.summary?.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      trend: 'up',
      color: 'orange'
    }
  ];

  // Fetch Analytics Data for charts
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalyticsData('monthly');
        // Only update chart data, preserve existing dashboard data
        setDashboardData(prev => ({
          ...prev,
          salesData: data.salesData,
          categoryData: data.categoryData,
          topProducts: data.topProducts,
          summary: {
            ...prev.summary,
            ...data.summary
          }
        }));
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalytics();
  }, []);

  // Sales Chart Data
  const salesChartData = dashboardData.salesData || [];

  // Category Chart Data
  const categoryChartData = dashboardData.categoryData || [];

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">{entry.name}:</span>
                <span className="font-medium ml-1 text-gray-900">
                  {entry.name === 'sales' ? `₹${entry.value.toLocaleString()}` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
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
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
      {children}
    </div>
  );

  // Card header component
  const CardHeader = ({ title, action, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );

  // Card content component
  const CardContent = ({ children, className = '', noPadding = false }) => (
    <div className={`${!noPadding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Merchant'}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Here's what's happening with your store today.
              </p>
            </div>
            <div className="relative">
              <select className="appearance-none px-4 py-2 pr-8 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="h-full"
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'green' ? 'bg-green-100 text-green-600' :
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                      </svg>
                    )}
                    Based on real data
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 h-full"
        >
          <Card>
            <CardHeader 
              title="Sales Overview"
              action={
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp size={16} className="text-green-500" />
                  <span>+12.5% from last week</span>
                </div>
              }
            />
            <CardContent>
              <div className="h-64 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      name="Sales"
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
            <CardHeader title="Sales by Category" />
            <CardContent>
              <div className="h-56 flex items-center justify-center mt-2 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ payload }) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                              <div className="flex items-center mb-1">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: data.color }}
                                />
                                <p className="font-medium text-gray-900">{data.name}</p>
                              </div>
                              <p className="text-sm text-gray-600">
                                {data.value}% of total
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right" 
                      layout="vertical"
                      iconSize={8}
                      wrapperStyle={{
                        paddingLeft: '20px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
            <div className="space-y-2">
              {/* Debug logging */}
              {console.log('Dashboard data for recent activity:', {
                recentOrders: dashboardData.recentOrders,
                hasRecentOrders: dashboardData.recentOrders && dashboardData.recentOrders.length > 0,
                fullDashboardData: dashboardData
              })}
              {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.slice(0, 4).map((order, index) => {
                  const orderId = order.channelOrderId || order.id;
                  const timeAgo = new Date(order.createdAt).toLocaleString();
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-start p-4 hover:bg-gray-50/80 transition-colors group rounded-lg"
                    >
                      <div className="flex-shrink-0 p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <ShoppingCart size={18} className="w-4 h-4" />
                      </div>
                      <div className="ml-4 flex-1 mr-3">
                        <p className="text-sm font-medium text-gray-900">
                          New order #{orderId} received
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {timeAgo}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          New
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500">
                  No recent activities
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
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
export default function MerchantDashboardPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT, USER_ROLES.ADMIN]}>
      <MerchantDashboardContent />
    </RoleProtected>
  );
}