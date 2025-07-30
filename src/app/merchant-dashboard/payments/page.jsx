'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Download, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, CheckCircle, XCircle, Filter, Search, X, Loader2, Calendar, BarChart3, Wallet } from 'lucide-react';
import { StatsCard } from '@/components/merchant-dashboard/StatsCard';
import WithdrawalModal from '@/components/merchant-dashboard/WithdrawalModal';

const transactionTypes = [
  { value: 'all', label: 'All Transactions' },
  { value: 'sale', label: 'Sales' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'refund', label: 'Refunds' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const getTypeIcon = (type) => {
  const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    marginRight: '12px'
  };

  const saleStyle = { backgroundColor: '#dbeafe', color: '#2563eb' };
  const withdrawalStyle = { backgroundColor: '#ede9fe', color: '#8b5cf6' };
  const refundStyle = { backgroundColor: '#fef3c7', color: '#f59e0b' };
  
  const style = type === 'sale' ? saleStyle : type === 'withdrawal' ? withdrawalStyle : refundStyle;
  
  return (
    <div style={{...iconStyle, ...style}}>
      {type === 'sale' ? (
        <ArrowDownLeft size={20} />
      ) : type === 'withdrawal' ? (
        <ArrowUpRight size={20} />
      ) : (
        <RefreshCw size={20} />
      )}
    </div>
  );
};

const getStatusIcon = (status) => {
  const iconStyle = { width: '16px', height: '16px' };
  
  switch (status) {
    case 'completed':
      return <CheckCircle style={{...iconStyle, color: '#10b981'}} />;
    case 'pending':
      return <Clock style={{...iconStyle, color: '#f59e0b'}} />;
    case 'failed':
      return <XCircle style={{...iconStyle, color: '#ef4444'}} />;
    default:
      return null;
  }
};

export default function PaymentsPage() {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState({
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    completedAmount: 0
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, hasMore: false });

  // Fetch payments from Razorpay API
  const fetchPayments = async (page = 1, status = 'all') => {
    console.log('🎯 Frontend: Fetching payments with params:', { page, status });
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }

      const url = `/api/razorpay/payments?${queryParams}`;
      console.log('📡 Frontend: Making request to:', url);
      
      const response = await fetch(url);
      const result = await response.json();

      console.log('📦 Frontend: API Response received:', {
        success: result.success,
        paymentsCount: result.data?.length || 0,
        pagination: result.pagination,
        summary: result.summary,
        error: result.error
      });

      if (result.success) {
        setPayments(result.data);
        setPagination(result.pagination);
        setPaymentsSummary(result.summary);
      } else {
        console.error('❌ Frontend: Failed to fetch payments:', result.error);
      }
    } catch (error) {
      console.error('🚨 Frontend: Error fetching payments:', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPayments();
  }, []);

  // Calculate totals from Razorpay data
  const { totalEarnings, pendingWithdrawals, availableBalance, thisMonthEarnings } = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totals = payments.reduce((acc, payment) => {
      const isThisMonth = new Date(payment.date) >= firstDayOfMonth;
      const amount = parseFloat(payment.amount) || 0;
      
      if (payment.type === 'sale' && payment.status === 'completed') {
        acc.totalEarnings += amount;
        if (isThisMonth) {
          acc.thisMonthEarnings += amount;
        }
      }
      
      // For now, we don't have withdrawal data from Razorpay
      // This would come from a separate system
      
      return acc;
    }, { 
      totalEarnings: 0, 
      pendingWithdrawals: 0,
      thisMonthEarnings: 0 
    });
    
    return {
      ...totals,
      availableBalance: totals.totalEarnings - totals.pendingWithdrawals
    };
  }, [payments]);

  // Filter payments from Razorpay
  const filteredTransactions = useMemo(() => {
    return payments.filter(payment => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = typeFilter === 'all' || payment.type === typeFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, searchTerm, typeFilter, statusFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    fetchPayments(1, 'all');
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    fetchPayments(1, value);
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || statusFilter !== 'all';

  // Professional inline styles
  const containerStyle = {
    padding: '32px 24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.5'
  };

  const withdrawButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    backgroundColor: availableBalance <= 0 ? '#e2e8f0' : '#3b82f6',
    color: availableBalance <= 0 ? '#94a3b8' : 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: availableBalance <= 0 ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: availableBalance <= 0 ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
    ':hover': {
      backgroundColor: availableBalance <= 0 ? '#e2e8f0' : '#2563eb',
      transform: availableBalance <= 0 ? 'none' : 'translateY(-1px)',
      boxShadow: availableBalance <= 0 ? 'none' : '0 6px 8px -1px rgba(59, 130, 246, 0.15)'
    }
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };

  const sectionStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const sectionTitleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0'
  };

  const filtersContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  };

  const searchInputStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle = {
    paddingLeft: '40px',
    paddingRight: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s ease',
    width: '280px',
    backgroundColor: 'white'
  };

  const selectStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  };

  const clearButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <motion.header 
        style={headerStyle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 style={titleStyle}>💳 Payment Management</h1>
          <p style={subtitleStyle}>Track earnings, manage withdrawals, and monitor transaction history</p>
        </div>
        <button 
          onClick={() => setIsWithdrawalModalOpen(true)}
          style={withdrawButtonStyle}
          disabled={availableBalance <= 0}
          onMouseEnter={(e) => {
            if (availableBalance > 0) {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 8px -1px rgba(59, 130, 246, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (availableBalance > 0) {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1)';
            }
          }}
        >
          <Download size={20} />
          Request Withdrawal
        </button>
      </motion.header>

      {/* Stats Cards */}
      <div style={statsGridStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            title="Total Earnings"
            value={formatCurrency(totalEarnings)}
            icon={DollarSign}
            change="+12% from last month"
            trend="up"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatsCard
            title="Available Balance"
            value={formatCurrency(availableBalance)}
            icon={Wallet}
            change="+8% from last month"
            trend="up"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatsCard
            title="Pending Withdrawals"
            value={formatCurrency(pendingWithdrawals)}
            icon={Clock}
            change={pendingWithdrawals > 0 ? `${Math.ceil(pendingWithdrawals / 100 * 3)} days to process` : 'No pending withdrawals'}
            trend={pendingWithdrawals > 0 ? 'down' : 'neutral'}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatsCard
            title="This Month"
            value={formatCurrency(thisMonthEarnings)}
            icon={BarChart3}
            change="+25% from last month"
            trend="up"
          />
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.section
        style={sectionStyle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>📊 Transaction History</h2>
          
          <div style={filtersContainerStyle}>
            <div style={searchInputStyle}>
              <Search 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  zIndex: 1
                }} 
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...inputStyle,
                  ':focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#6b7280';
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#9ca3af';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              style={selectStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              style={selectStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                style={clearButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.color = '#475569';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.color = '#64748b';
                }}
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredTransactions.map((transaction, index) => (
                  <motion.article
                    key={transaction.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                      delay: Math.min(index * 0.03, 0.3)
                    }}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(transaction.type)}
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                            {transaction.description}
                          </h3>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {formatDate(transaction.date)}
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {getStatusIcon(transaction.status)}
                              <span style={{ textTransform: 'capitalize' }}>{transaction.status}</span>
                            </span>
                          </p>
                        </div>
                      </div>
                      <p style={{
                        margin: '0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: transaction.type === 'sale' ? '#059669' : '#dc2626'
                      }}>
                        {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Transaction ID
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginTop: '4px', fontFamily: 'monospace' }}>
                          {transaction.id}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Payment Method
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginTop: '4px' }}>
                          {transaction.paymentMethod || 'Credit Card'}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Reference
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginTop: '4px' }}>
                          {transaction.reference || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '64px 32px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#9ca3af'
                }}>
                  <DollarSign size={32} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#374151' }}>No transactions found</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#64748b', maxWidth: '400px' }}>
                  {hasActiveFilters
                    ? 'No transactions match your current filters. Try adjusting your search or filter criteria.'
                    : 'You currently have no transactions. Completed transactions will appear here.'}
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#e2e8f0';
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        availableBalance={availableBalance}
      />
    </div>
  );
}