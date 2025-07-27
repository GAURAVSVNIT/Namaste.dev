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
import OrderDetailsModal from '@/components/fashion-creator-dashboard/OrderDetailsModal';

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'paid', label: 'Paid' },
];

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'shiprocket', label: 'Shiprocket' },
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
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, hasMore: false });
  const [ordersSummary, setOrdersSummary] = useState({ shiprocket: 0, total: 0 });

  // Fetch orders from Shiprocket API
  const fetchOrders = async (page = 1, status = 'all', source = 'all', search = '') => {
    console.log('🎯 Frontend: Fetching orders with params:', { page, status, source, search });
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      
      if (source && source !== 'all') {
        queryParams.append('source', source);
      }

      const url = `/api/fashion-creator/orders?${queryParams}`;
      console.log('📡 Frontend: Making request to:', url);
      
      const response = await fetch(url);
      const result = await response.json();

      console.log('📦 Frontend: API Response received:', {
        success: result.success,
        ordersCount: result.data?.length || 0,
        pagination: result.pagination,
        summary: result.summary,
        error: result.error
      });

      if (result.success) {
        console.log('✅ Frontend: Orders data:', {
          totalOrders: result.data.length,
          sources: {
            shiprocket: result.data.filter(o => o.source === 'shiprocket').length
          },
          paymentStatuses: {
            paid_online: result.data.filter(o => o.paymentStatus === 'paid_online').length,
            cod: result.data.filter(o => o.paymentStatus === 'cod').length,
            pending: result.data.filter(o => o.paymentStatus === 'pending').length
          },
          sampleOrders: result.data.slice(0, 3).map(o => ({
            id: o.orderId,
            source: o.source,
            status: o.status,
            paymentStatus: o.paymentStatus,
            customer: o.customerName,
            total: o.total
          }))
        });
        
        setOrders(result.data);
        setPagination(result.pagination);
        setOrdersSummary(result.summary || { shiprocket: 0, total: 0 });
      } else {
        console.error('❌ Frontend: Failed to fetch orders:', result.error);
      }
    } catch (error) {
      console.error('🚨 Frontend: Error fetching orders:', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
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
    setSourceFilter('all');
    fetchOrders(1, 'all', 'all');
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, statusFilter, sourceFilter, searchTerm);
  };


  return (
    <div style={{
      padding: '2rem',
      maxWidth: '100%',
      margin: '0 auto',
      backgroundColor: '#fafbfc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <motion.header 
        style={{
          marginBottom: '2.5rem',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid #e1e5e9',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              color: '#1a1d23',
              margin: '0 0 0.5rem 0',
              lineHeight: '1.2',
              letterSpacing: '-0.025em'
            }}>Fashion Orders</h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              margin: '0',
              fontWeight: '400'
            }}>Track and manage your fashion creation orders</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#f0f4ff',
              padding: '0.875rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #e0e7ff'
            }}>
              <span style={{
                color: '#4338ca',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Shiprocket: {ordersSummary.shiprocket}</span>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '0.875rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{
                color: '#475569',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Total: {ordersSummary.total}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search and Filter */}
      <motion.div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid #e1e5e9',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div style={{
          position: 'relative',
          flex: '1',
          maxWidth: '100%'
        }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none',
            width: '1.25rem',
            height: '1.25rem'
          }} />
          <input
            type="text"
            placeholder="Search fashion orders, customers, or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              borderRadius: '12px',
              border: '1px solid #e1e5e9',
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              color: '#111827',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4338ca';
              e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e1e5e9';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#6b7280'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              aria-label="Clear search"
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              fetchOrders(1, value, sourceFilter);
            }}
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
          
          <Select 
            value={sourceFilter} 
            onValueChange={(value) => {
              setSourceFilter(value);
              fetchOrders(1, statusFilter, value);
            }}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent className={styles.selectContent}>
              {sourceOptions.map((option) => (
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
          
          {(searchTerm || statusFilter !== 'all' || sourceFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
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
                  <div className="flex flex-col gap-1">
                    <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <div className="flex gap-1">
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                        Shiprocket
                      </span>
                      {order.paymentStatus === 'paid_online' && (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                          Paid Online
                        </span>
                      )}
                      {order.paymentStatus === 'cod' && (
                        <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">
                          COD
                        </span>
                      )}
                    </div>
                  </div>
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
                      onClick={() => handleViewOrder(order)}
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
      
      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
}

// Main component with role protection
export default function OrdersPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.FASHION_CREATOR, USER_ROLES.ADMIN]}>
      <OrdersPageContent />
    </RoleProtected>
  );
}
