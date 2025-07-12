'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/merchant-dashboard/StatsCard';
import { useDashboard } from '@/context/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { state } = useDashboard();

  const recentOrders = state.orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your store today.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={state.stats.totalOrders}
          icon={ShoppingCart}
          change="+12% from last month"
          trend="up"
          delay={0.1}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${state.stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+8% from last month"
          trend="up"
          delay={0.2}
        />
        <StatsCard
          title="Products"
          value={state.stats.totalProducts}
          icon={Package}
          change="+3 new this week"
          trend="up"
          delay={0.3}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${state.stats.conversionRate}%`}
          icon={TrendingUp}
          change="+0.5% from last week"
          trend="up"
          delay={0.4}
        />
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}