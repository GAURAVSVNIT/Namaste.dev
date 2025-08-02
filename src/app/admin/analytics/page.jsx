'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Package,
  DollarSign,
  Activity,
  Globe
} from 'lucide-react';
import { getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES, ROLE_LABELS } from '@/lib/roles';
import RoleProtected from '@/components/auth/RoleProtected';

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    usersByRole: {},
    userCreationDates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch users data
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Count users by role (only valid roles)
      const usersByRole = users.reduce((acc, user) => {
        const role = user.role || 'member';
        // Only count valid roles defined in USER_ROLES
// Validate role and set 'member' as default
        const validRole = Object.values(USER_ROLES).includes(role) ? role : 'member';
        acc[validRole] = (acc[validRole] || 0) + 1;
        return acc;
      }, {});

      // Get user creation dates for growth analysis
      const userCreationDates = users
        .filter(user => user.created_at)
        .map(user => {
          const date = user.created_at.toDate ? user.created_at.toDate() : new Date(user.created_at);
          return {
            date,
            role: user.role || 'member'
          };
        })
        .sort((a, b) => a.date - b.date);

      setAnalytics({
        totalUsers: users.length,
        usersByRole,
        userCreationDates
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user growth from creation dates
  const getRecentGrowth = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = analytics.userCreationDates.filter(user => user.date > thirtyDaysAgo);
    return recentUsers.length;
  };

  const recentGrowth = getRecentGrowth();
  const growthPercentage = analytics.totalUsers > 0 ? ((recentGrowth / analytics.totalUsers) * 100).toFixed(1) : '0';

  const statsCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      change: `+${recentGrowth} this month`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ];

  const roleCards = Object.entries(analytics.usersByRole).map(([role, count]) => ({
    role,
    count,
    percentage: ((count / analytics.totalUsers) * 100).toFixed(1)
  }));

  if (loading) {
    return (
      <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          </div>
        </div>
      </RoleProtected>
    );
  }

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Analytics & Reports
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Monitor platform performance and user engagement metrics.
            </p>
          </motion.div>


          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </h3>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* User Roles Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">User Distribution by Role</h3>
            </div>
            {roleCards.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-8">
                {/* Main Circular Chart - Bigger */}
                <div className="relative flex items-center justify-center">
                  <svg width="300" height="300" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="150"
                      cy="150"
                      r="120"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="16"
                    />
                    {/* Role segments */}
                    {roleCards.map((roleData, index) => {
                      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
                      const percentage = parseFloat(roleData.percentage);
                      const circumference = 2 * Math.PI * 120;
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                      
                      // Calculate offset based on previous segments
                      const prevPercentages = roleCards.slice(0, index).reduce((sum, role) => sum + parseFloat(role.percentage), 0);
                      const strokeDashoffset = -((prevPercentages / 100) * circumference);
                      
                      return (
                        <circle
                          key={roleData.role}
                          cx="150"
                          cy="150"
                          r="120"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 ease-in-out"
                        />
                      );
                    })}
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-gray-900">{analytics.totalUsers}</div>
                    <div className="text-lg text-gray-500">Total Users</div>
                  </div>
                </div>
                
                {/* Linear User Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl">
                  {roleCards.map((roleData, index) => {
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
                    return (
                      <div key={roleData.role} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:scale-105">
                        <div className="flex items-center mb-3">
                          <div 
                            className="w-5 h-5 rounded-full mr-3" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {ROLE_LABELS[roleData.role] || roleData.role}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">{roleData.count}</div>
                          <div className="text-sm text-gray-500">{roleData.percentage}% of users</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No user data available yet.</p>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center text-gray-500 text-sm"
          >
            <p>Analytics data is updated in real-time. Last updated: {new Date().toLocaleString()}</p>
          </motion.div>
        </div>
      </div>
    </RoleProtected>
  );
};

export default AdminAnalyticsPage;
