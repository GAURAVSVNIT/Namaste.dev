'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Download, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, CheckCircle, XCircle, Filter, Search, X, Loader2, Palette, Scissors, Sparkles, Crown } from 'lucide-react';
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

  const saleStyle = { backgroundColor: '#ede9fe', color: '#8b5cf6' };
  const withdrawalStyle = { backgroundColor: '#fdf2f8', color: '#ec4899' };
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

  // Professional fashion-themed inline styles
  const containerStyle = {
    padding: '32px 24px',
    background: '#ffffffff',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(0, 0, 0, 0.1)'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.5'
  };

  const withdrawButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    backgroundColor: availableBalance <= 0 ? '#f3f4f6' : '#8B5CF6',
    color: availableBalance <= 0 ? '#9ca3af' : 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: availableBalance <= 0 ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };

  const sectionStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)'
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const sectionTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0'
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
          <h1 style={titleStyle}>✨ Fashion Creator Earnings</h1>
          <p style={subtitleStyle}>Manage your creative income and track fashion design sales</p>
        </div>
        <button 
          onClick={() => setIsWithdrawalModalOpen(true)}
          style={withdrawButtonStyle}
          disabled={availableBalance <= 0}
          onMouseEnter={(e) => {
            if (availableBalance > 0) {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (availableBalance > 0) {
              e.target.style.backgroundColor = '#8B5CF6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          <Crown size={20} />
          Request Payout
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
            title="Design Earnings"
            value={formatCurrency(totalEarnings)}
            icon={Palette}
            change="+18% from last month"
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
            icon={Sparkles}
            change="+12% from last month"
            trend="up"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatsCard
            title="Pending Payouts"
            value={formatCurrency(pendingWithdrawals)}
            icon={Clock}
            change={pendingWithdrawals > 0 ? `${Math.ceil(pendingWithdrawals / 100 * 3)} days to process` : 'No pending payouts'}
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
            icon={Scissors}
            change="+35% from last month"
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
          <h2 style={sectionTitleStyle}>🎨 Creative Earnings</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  fontSize: '14px',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  width: '280px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8B5CF6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
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
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                border: '2px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                minWidth: '140px'
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
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                border: '2px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                minWidth: '140px'
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#8B5CF6',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
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
                  border: '4px solid rgba(139, 92, 246, 0.2)',
                  borderTop: '4px solid #8B5CF6',
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
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                      boxShadow: '0 4px 6px rgba(139, 92, 246, 0.1)',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(10px)'
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
                      gap: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(139, 92, 246, 0.1)'
                    }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Transaction ID
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginTop: '4px', fontFamily: 'monospace' }}>
                          {transaction.id}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Payment Method
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginTop: '4px' }}>
                          {transaction.paymentMethod || 'Credit Card'}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                  width: '80px',
                  height: '80px',
                  background: '#374151',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: 'white'
                }}>
                  <Palette size={40} />
                </div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>No transactions found</h3>
                <p style={{ margin: '0 0 32px 0', fontSize: '16px', color: '#64748b', maxWidth: '400px', lineHeight: '1.6' }}>
                  {hasActiveFilters
                    ? 'No transactions match your current filters. Try adjusting your search or filter criteria.'
                    : 'Your creative earnings will appear here once you start selling your designs.'}
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    style={{
                      padding: '14px 28px',
                      background: '#8B5CF6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)'
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