'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import { 
  ShoppingBag, 
  Scissors, 
  Users, 
  BarChart3, 
  Settings, 
  Database,
  MessageCircle,
  TrendingUp,
  Package,
  Calendar,
  Globe,
  Shield,
  Brain
} from 'lucide-react';

const AdminDashboard = () => {
  const dashboardItems = [
    {
      title: 'Merchant Dashboard',
      description: 'Manage merchant accounts, products, and orders',
      href: '/merchant-dashboard',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      title: 'Fashion Creator Dashboard',
      description: 'Oversee fashion creators, portfolios, and services',
      href: '/fashion-creator-dashboard',
      icon: Scissors,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      hoverColor: 'hover:bg-green-100'
    },
    {
      title: 'Analytics & Reports',
      description: 'View platform analytics and generate reports',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      title: 'Social Media Management',
      description: 'Moderate content, manage communities',
      href: '/social',
      icon: Globe,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      hoverColor: 'hover:bg-pink-100'
    },
    {
      title: 'Marketplace Management',
      description: 'Oversee marketplace products and transactions',
      href: '/marketplace',
      icon: Package,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      title: 'Content Management',
      description: 'Manage blogs, tutorials, and platform content',
      href: '/blog',
      icon: MessageCircle,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      hoverColor: 'hover:bg-teal-100'
    },
    {
      title: 'Consultation Management',
      description: 'Oversee consultation bookings and schedules',
      href: '/consultation',
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      hoverColor: 'hover:bg-emerald-100'
    },
    {
      title: 'Create Quiz',
      description: 'Create and manage interactive fashion quizzes',
      href: '/quiz/create',
      icon: Brain,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      hoverColor: 'hover:bg-amber-100'
    }
  ];

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Admin Control Panel
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage all aspects of the Namaste.dev platform from this centralized dashboard. 
              Access all tools and features to monitor, configure, and optimize the platform.
            </p>
          </motion.div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Link href={item.href}>
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg ${item.hoverColor} group cursor-pointer h-full`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`w-6 h-6 ${item.textColor}`} />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                        {item.description}
                      </p>
                      
                      <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-600 transition-colors">
                        <span>Access Panel</span>
                        <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-12 text-center text-gray-500 text-sm"
          >
            <p>Admin access granted. Use these tools responsibly to maintain platform quality.</p>
          </motion.div>
        </div>
      </div>
    </RoleProtected>
  );
};

export default AdminDashboard;
