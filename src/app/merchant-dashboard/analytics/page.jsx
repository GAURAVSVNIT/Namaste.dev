'use client';

import React, { useState, useEffect } from 'react';
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
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import { getAnalyticsData, subscribeToAnalyticsUpdates } from '@/lib/analytics';


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

// Inline styles objects
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#f8fafc'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '400'
  },
  select: {
    appearance: 'none',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 40px 8px 12px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  chartsGrid: baseWindowWidth => ({
    display: 'grid',
    gridTemplateColumns: baseWindowWidth >= 1024 ? '2fr 1fr' : '1fr',
    gap: '24px'
  }),
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center'
  },
  chartContainer: {
    height: '300px',
    width: '100%'
  },
  legend: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#64748b'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px',
    flexShrink: 0
  }
};

function AnalyticsPageContent() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [analytics, setAnalytics] = useState({
    salesData: [],
    categoryData: [],
    topProducts: [],
    summary: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
    }
  });

  // Adjust window size dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Fetch analytics data based on time range
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAnalyticsData(timeRange);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();

    // Subscribe to real-time updates
    const unsubscribeUpdates = subscribeToAnalyticsUpdates((updates) => {
      // Only update summary stats, not the time-based data
      if (updates.summary) {
        setAnalytics(prev => ({ 
          ...prev, 
          summary: { ...prev.summary, ...updates.summary }
        }));
      }
    });
    
    return () => {
      unsubscribeUpdates();
    };
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div>
          <h1 style={styles.title}>Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            Track your store performance and gain valuable insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              style={{
                ...styles.select,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
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
          <div style={styles.statsGrid}>
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
            style={styles.statsGrid}
          >
            <StatsCard
              title="Total Sales"
              value={`₹${analytics.summary.totalSales.toLocaleString()}`}
              icon={ShoppingBag}
              change={timeRange === 'monthly' ? "+12% from last month" : "Viewing current period"}
              trend="up"
              delay={0.1}
              color="#3B82F6"
            />
            <StatsCard
              title="Total Orders"
              value={analytics.summary.totalOrders.toLocaleString()}
              icon={ShoppingBag}
              change={timeRange === 'monthly' ? "+8% from last month" : "Viewing current period"}
              trend="up"
              delay={0.2}
              color="#10B981"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${analytics.summary.conversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              change={timeRange === 'monthly' ? "+1.2% from last month" : "Viewing current period"}
              trend="up"
              delay={0.3}
              color="#8B5CF6"
            />
            <StatsCard
              title="Avg. Order Value"
              value={`₹${analytics.summary.averageOrderValue.toFixed(2)}`}
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {
          [
            { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
            { id: 'sales', label: 'Sales', icon: <DollarSign size={16} /> },
            { id: 'products', label: 'Products', icon: <ShoppingBag size={16} /> },
            { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#6b7280';
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive ? '#2563eb' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  paddingBottom: '6px',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })
        }
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
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px'
            }}
            className="lg:grid-cols-[2fr_1fr]"
          >
            {/* Sales & Orders Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h3 style={styles.chartTitle}>
                    <BarChart2 size={20} className="inline-block mr-2 -mt-1" />
                    Sales & Orders
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <select 
                      style={styles.select}
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
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.salesData}>
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
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
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
                        dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#3B82F6' }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="orders" 
                        name="Orders"
                        stroke="#10B981" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#10B981' }}
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
              transition={{ delay: 0.4 }}
            >
              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h3 style={styles.chartTitle}>
                    <PieChartIcon size={20} className="inline-block mr-2 -mt-1" />
                    Category Distribution
                  </h3>
                </div>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={renderCustomizedLabel}
                        labelLine={false}
                      >
                        {analytics.categoryData.map((entry, index) => (
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
                <div style={styles.legend}>
                  {analytics.categoryData.map((category, index) => (
                    <div key={index} style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, backgroundColor: category.color }} />
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
        style={{ marginTop: '24px' }}
      >
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={20} style={{ marginRight: '8px' }} />
              Top Performing Products
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  style={{ appearance: 'none', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 36px 8px 12px', fontSize: '14px', color: '#1e293b', outline: 'none' }}
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                >
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                </select>
                <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#9ca3af' }} />
              </div>
              <button style={{ padding: '8px', color: '#6b7280', borderRadius: '8px', transition: 'background-color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Download size={18} />
              </button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Product
                  </th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category
                  </th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sales
                  </th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Revenue
                  </th>
                  <th style={{ padding: '24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th style={{ padding: '24px', textAlign: 'left' }}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {analytics.topProducts.map((product, index) => (
                  <tr key={index} style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flexShrink: 0, height: '40px', width: '40px', backgroundColor: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                          <ShoppingBag size={18} />
                        </div>
                        <div style={{ marginLeft: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>SKU: {Math.floor(100000 + Math.random() * 900000)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', color: '#1f2937' }}>
                      {product.sales.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      ${product.revenue.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', backgroundColor: product.status === 'in_stock' ? '#dcfce7' : product.status === 'low_stock' ? '#fef9c3' : '#fee2e2', color: product.status === 'in_stock' ? '#166534' : product.status === 'low_stock' ? '#92400e' : '#b91c1c' }}>
                        {product.status === 'in_stock' 
                          ? 'In Stock' 
                          : product.status === 'low_stock'
                          ? `Low Stock (${product.stock})`
                          : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#3b82f6' }}>
                      <button style={{ backgroundColor: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#3b82f6' }} onMouseOver={(e) => e.currentTarget.style.color = '#1e40af'} onMouseOut={(e) => e.currentTarget.style.color = '#3b82f6'}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing <span style={{ fontWeight: '500' }}>1</span> to <span style={{ fontWeight: '500' }}>{analytics.topProducts.length}</span> of{' '}
              <span style={{ fontWeight: '500' }}>{analytics.topProducts.length}</span> results
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280', backgroundColor: '#ffffff', cursor: 'not-allowed', opacity: 0.5 }}
                disabled
              >
                Previous
              </button>
              <button
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280', backgroundColor: '#ffffff', cursor: 'not-allowed', opacity: 0.5 }}
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
