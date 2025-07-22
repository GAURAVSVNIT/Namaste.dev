'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, Truck, Calendar, Clock, Package, CreditCard, User, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import styles from './Orders.module.css';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return styles.statusPending;
    case 'processing': return styles.statusProcessing;
    case 'shipped': return styles.statusShipped;
    case 'delivered': return styles.statusDelivered;
    case 'cancelled': return styles.statusCancelled;
    default: return '';
  }
};

function OrdersPageContent() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, hasMore: false });

  // Fetch orders from Shiprocket API
  const fetchOrders = async (page = 1, status = 'all', search = '') => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }

      const response = await fetch(`/api/shiprocket/orders?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setPagination(result.pagination);
      } else {
        console.error('Failed to fetch orders:', result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/shiprocket/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        console.error('Failed to fetch order details:', result.error);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.total, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    fetchOrders(1, 'all');
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, statusFilter, searchTerm);
  };

  const handleViewOrder = (orderId) => {
    fetchOrderDetails(orderId);
  };

  return (
    <div className={styles.ordersContainer}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className={styles.title}>Orders</h1>
        <p className={styles.subtitle}>Track and manage customer orders</p>
      </motion.header>

      {/* Search and Filter */}
      <motion.div 
        className={styles.filters}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders, customers, or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className={styles.selectContent}>
              {statusOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={styles.selectItem}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchTerm || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <motion.article
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ 
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  delay: Math.min(index * 0.05, 0.5) // Cap the delay at 0.5s
                }}
                className={styles.orderCard}
              >
                <div className={styles.orderHeader}>
                  <div>
                    <h3 className={styles.orderId}>Order #{order.orderId}</h3>
                    <p className={styles.customerName}>
                      <User className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                      {order.customerName}
                    </p>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Order Date
                    </p>
                    <p className="font-medium">{formatDate(order.orderDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Package className="w-3.5 h-3.5 mr-1.5" />
                      Items
                    </p>
                    <p className="font-medium">{order.items.length} items</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center">
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      Total Amount
                    </p>
                    <p className="font-medium text-lg text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <div className="flex items-center flex-wrap gap-2 text-sm">
                    <span className="inline-flex items-center text-gray-500">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {order.updatedAt ? `Updated ${formatDate(order.updatedAt)}` : 'Just now'}
                    </span>
                    {order.awbCode && (
                      <span className="inline-flex items-center text-blue-600">
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        AWB: {order.awbCode}
                      </span>
                    )}
                    {order.courierName && (
                      <span className="inline-flex items-center text-green-600">
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        {order.courierName}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.actions}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={styles.viewButton}
                      onClick={() => handleViewOrder(order.id)}
                      disabled={isLoading}
                    >
                      <Eye className={styles.viewButtonIcon} />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isLoading}
                      title="Refresh orders"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={styles.emptyState}
            >
              <Package className={styles.emptyStateIcon} />
              <h3 className={styles.emptyStateTitle}>No orders found</h3>
              <p className={styles.emptyStateDescription}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your current filters. Try adjusting your search or filter criteria.'
                  : 'You currently have no orders. New orders will appear here.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Main component with role protection
export default function OrdersPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT, USER_ROLES.ADMIN]}>
      <OrdersPageContent />
    </RoleProtected>
  );
}
