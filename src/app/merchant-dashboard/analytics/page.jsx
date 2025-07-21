'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  Download,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  ChevronDown,
  Loader2,
  DollarSign
} from 'lucide-react';
import { StatsCard } from '@/components/merchant-dashboard/StatsCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import styles from './Analytics.module.css';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

const salesData = [
  { name: 'Jan', sales: 4200, orders: 240, visitors: 1200 },
  { name: 'Feb', sales: 3800, orders: 139, visitors: 1100 },
  { name: 'Mar', sales: 5200, orders: 980, visitors: 1800 },
  { name: 'Apr', sales: 4780, orders: 390, visitors: 1500 },
  { name: 'May', sales: 5890, orders: 480, visitors: 2000 },
  { name: 'Jun', sales: 6390, orders: 380, visitors: 2200 },
  { name: 'Jul', sales: 7490, orders: 430, visitors: 2500 },
];

const topProducts = [
  { 
    name: 'Classic T-Shirt', 
    sales: 145, 
    revenue: 4350,
    category: 'T-Shirts',
    stock: 24,
    status: 'in_stock'
  },
  { 
    name: 'Denim Jacket', 
    sales: 89, 
    revenue: 8009,
    category: 'Jackets',
    stock: 5,
    status: 'low_stock'
  },
  { 
    name: 'Summer Dress', 
    sales: 67, 
    revenue: 4020,
    category: 'Dresses',
    stock: 0,
    status: 'out_of_stock'
  },
  { 
    name: 'Sneakers', 
    sales: 45, 
    revenue: 5400,
    category: 'Shoes',
    stock: 12,
    status: 'in_stock'
  },
];

const categoryData = [
  { name: 'T-Shirts', value: 35, color: '#3B82F6' },
  { name: 'Jackets', value: 25, color: '#EF4444' },
  { name: 'Dresses', value: 20, color: '#10B981' },
  { name: 'Shoes', value: 12, color: '#8B5CF6' },
  { name: 'Accessories', value: 8, color: '#F59E0B' },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center text-sm">
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium ml-1 text-gray-900">
                {entry.name === 'Sales' || entry.name === 'Revenue' 
                  ? `$${entry.value.toLocaleString()}` 
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if segment is large enough
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#4B5563"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function AnalyticsPageContent() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simulate loading state
  const handleTimeRangeChange = (value) => {
    setIsLoading(true);
    setTimeRange(value);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Calculate totals for summary cards
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const totalVisitors = salesData.reduce((sum, item) => sum + item.visitors, 0);
  const conversionRate = ((totalOrders / totalVisitors) * 100).toFixed(1);
  
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
          <p className={styles.subtitle}>
            Track your store performance and gain valuable insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
          <button 
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {}}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl p-5 border border-gray-200 h-full"
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            key="stats-cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.statsGrid}
          >
            <StatsCard
              title="Total Sales"
              value={`$${totalSales.toLocaleString()}`}
              icon={ShoppingBag}
              change={timeRange === 'monthly' ? "+12% from last month" : "Viewing current period"}
              trend="up"
              delay={0.1}
              color="#3B82F6"
            />
            <StatsCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              icon={ShoppingBag}
              change={timeRange === 'monthly' ? "+8% from last month" : "Viewing current period"}
              trend="up"
              delay={0.2}
              color="#10B981"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              icon={TrendingUp}
              change={timeRange === 'monthly' ? "+1.2% from last month" : "Viewing current period"}
              trend="up"
              delay={0.3}
              color="#8B5CF6"
            />
            <StatsCard
              title="Avg. Order Value"
              value={`$${(totalSales / totalOrders).toFixed(2)}`}
              icon={DollarSign}
              change={timeRange === 'monthly' ? "+3.5% from last month" : "Viewing current period"}
              trend="up"
              delay={0.4}
              color="#F59E0B"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
          { id: 'sales', label: 'Sales', icon: <DollarSign size={16} /> },
          { id: 'products', label: 'Products', icon: <ShoppingBag size={16} /> },
          { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 pb-2 -mb-[1px]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${i === 1 ? 'lg:col-span-2' : ''} bg-white rounded-xl p-5 border border-gray-200`}
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            key="charts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.chartsGrid}
          >
            {/* Sales & Orders Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>
                    <BarChart2 size={20} className="inline-block mr-2 -mt-1" />
                    Sales & Orders
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <select 
                      className={styles.select}
                      value={timeRange}
                      onChange={(e) => handleTimeRangeChange(e.target.value)}
                    >
                      <option value="daily">Today</option>
                      <option value="weekly">This Week</option>
                      <option value="monthly">This Month</option>
                      <option value="yearly">This Year</option>
                    </select>
                  </div>
                </div>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
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
                        tickFormatter={(value) => `$${value / 1000}k`}
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
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="sales" 
                        name="Sales ($)"
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#salesGradient)"
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
                    </AreaChart>
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
              transition={{ delay: 0.4 }}
            >
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>
                    <PieChartIcon size={20} className="inline-block mr-2 -mt-1" />
                    Category Distribution
                  </h3>
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
                        label={renderCustomizedLabel}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="#fff" 
                            strokeWidth={1.5}
                            style={{
                              filter: `drop-shadow(0px 1px 2px ${entry.color}40)`
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ payload }) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
                                <div className="flex items-center mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <p className="font-medium text-gray-900">{data.name}</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {data.value}% of total sales
                                </p>
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
                      <span className="ml-auto font-medium text-gray-900">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Top Performing Products
            </h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                >
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          <ShoppingBag size={18} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">SKU: {Math.floor(100000 + Math.random() * 900000)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'in_stock' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'low_stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'in_stock' 
                          ? 'In Stock' 
                          : product.status === 'low_stock'
                          ? `Low Stock (${product.stock})`
                          : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{topProducts.length}</span> of{' '}
              <span className="font-medium">{topProducts.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Previous
              </button>
              <button 
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main component with role protection
export default function AnalyticsPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT, USER_ROLES.ADMIN]}>
      <AnalyticsPageContent />
    </RoleProtected>
  );
}
