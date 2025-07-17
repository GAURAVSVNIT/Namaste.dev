'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, ShoppingBag, ArrowUp, ArrowDown, Filter, Download } from 'lucide-react';
import { StatsCard } from '@/components/merchant-dashboard/StatsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import styles from './Analytics.module.css';

const salesData = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 139 },
  { name: 'Mar', sales: 2000, orders: 980 },
  { name: 'Apr', sales: 2780, orders: 390 },
  { name: 'May', sales: 1890, orders: 480 },
  { name: 'Jun', sales: 2390, orders: 380 },
  { name: 'Jul', sales: 3490, orders: 430 },
];

const topProducts = [
  { name: 'Classic T-Shirt', sales: 145, revenue: 4350 },
  { name: 'Denim Jacket', sales: 89, revenue: 8009 },
  { name: 'Summer Dress', sales: 67, revenue: 4020 },
  { name: 'Sneakers', sales: 45, revenue: 5400 },
];

const categoryData = [
  { name: 'T-Shirts', value: 35, color: '#3B82F6' },
  { name: 'Jackets', value: 25, color: '#EF4444' },
  { name: 'Dresses', value: 20, color: '#10B981' },
  { name: 'Accessories', value: 20, color: '#F59E0B' },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Sales' ? `$${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('monthly');
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <div>
          <h1 className={styles.title}>Analytics Dashboard</h1>
          <p className={styles.subtitle}>Track your store performance and gain valuable insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.select}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Download size={18} className="text-gray-500" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Visitors"
          value="12,345"
          icon={Users}
          change="+15% from last month"
          trend="up"
          delay={0.1}
        />
        <StatsCard
          title="Page Views"
          value="45,678"
          icon={TrendingUp}
          change="+12% from last month"
          trend="up"
          delay={0.2}
        />
        <StatsCard
          title="Conversion Rate"
          value="3.4%"
          icon={TrendingDown}
          change="-0.2% from last month"
          trend="down"
          delay={0.3}
        />
        <StatsCard
          title="Avg Order Value"
          value="$89.50"
          icon={ShoppingBag}
          change="+8% from last month"
          trend="up"
          delay={0.4}
        />
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Sales & Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Sales & Orders</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter size={16} />
                <select className="text-sm bg-transparent border-0 focus:ring-0 focus:outline-none">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="#3B82F6" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#10B981" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sales" 
                    name="Sales ($)"
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders"
                    stroke="#10B981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span>Total Sales</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <span>Total Orders</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Category Distribution</h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ payload }) => {
                      if (payload && payload[0]) {
                        return (
                          <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
                            <p className="font-medium">{payload[0].name}</p>
                            <p>{payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.legend}>
              {categoryData.map((category, index) => (
                <div key={index} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: category.color }} />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Top Performing Products</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="font-medium">{product.name}</td>
                    <td>{product.sales} sold</td>
                    <td>${product.revenue.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.badge} ${index % 3 === 0 ? styles.badgeSuccess : index % 3 === 1 ? styles.badgeWarning : styles.badgeDanger}`}>
                        {index % 3 === 0 ? 'In Stock' : index % 3 === 1 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}