'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Download, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, CheckCircle, XCircle, Filter, Search, X } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/merchant-dashboard/StatsCard';
import WithdrawalModal from '@/components/merchant-dashboard/WithdrawalModal';
import styles from './Payments.module.css';

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

const getStatusClass = (status) => {
  switch (status) {
    case 'completed': return styles.statusCompleted;
    case 'pending': return styles.statusPending;
    case 'failed': return styles.statusFailed;
    default: return '';
  }
};

const getTypeIcon = (type, className = '') => {
  const baseClass = `${styles.transactionIcon} ${
    type === 'sale' ? 'bg-blue-100 text-blue-600' :
    type === 'withdrawal' ? 'bg-purple-100 text-purple-600' :
    'bg-amber-100 text-amber-600'
  }`;
  
  return (
    <div className={`${baseClass} ${className}`}>
      {type === 'sale' ? (
        <ArrowDownLeft className="w-5 h-5" />
      ) : type === 'withdrawal' ? (
        <ArrowUpRight className="w-5 h-5" />
      ) : (
        <RefreshCw className="w-5 h-5" />
      )}
    </div>
  );
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export default function PaymentsPage() {
  const { state } = useDashboard();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const { totalEarnings, pendingWithdrawals, availableBalance, thisMonthEarnings } = useMemo(() => {
    const transactions = state.transactions || [];
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totals = transactions.reduce((acc, t) => {
      const isThisMonth = new Date(t.date) >= firstDayOfMonth;
      const amount = parseFloat(t.amount) || 0;
      
      if (t.type === 'sale' && t.status === 'completed') {
        acc.totalEarnings += amount;
        if (isThisMonth) {
          acc.thisMonthEarnings += amount;
        }
      }
      
      if (t.type === 'withdrawal' && t.status === 'pending') {
        acc.pendingWithdrawals += amount;
      }
      
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
  }, [state.transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return (state.transactions || []).filter(transaction => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.transactions, searchTerm, typeFilter, statusFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className={styles.paymentsContainer}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>Manage your earnings and withdrawals</p>
        </div>
        <button 
          onClick={() => setIsWithdrawalModalOpen(true)}
          className={styles.withdrawButton}
          disabled={availableBalance <= 0}
        >
          <Download className="w-5 h-5" />
          Request Withdrawal
        </button>
      </motion.header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
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
            icon={CreditCard}
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
            icon={TrendingUp}
            change="+25% from last month"
            trend="up"
          />
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.transactionsHeader}>
          <h2 className={styles.sectionTitle}>Transaction History</h2>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-sm text-gray-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className={styles.transactionList}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
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
                  className={styles.transactionCard}
                >
                  <div className={styles.transactionHeader}>
                    <div className={styles.transactionInfo}>
                      {getTypeIcon(transaction.type, 'mr-3')}
                      <div>
                        <h3 className={styles.transactionType}>
                          {transaction.description}
                        </h3>
                        <p className={styles.transactionDate}>
                          {formatDate(transaction.date)}
                          <span className="mx-2">•</span>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status}</span>
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className={`${styles.transactionAmount} ${
                      transaction.type === 'sale' ? styles.amountPositive : styles.amountNegative
                    }`}>
                      {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  <div className={styles.transactionDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span>Transaction ID</span>
                      </span>
                      <span className={styles.detailValue}>
                        {transaction.id}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span>Payment Method</span>
                      </span>
                      <span className={styles.detailValue}>
                        {transaction.paymentMethod || 'Credit Card'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <span>Reference</span>
                      </span>
                      <span className={styles.detailValue}>
                        {transaction.reference || 'N/A'}
                      </span>
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
                <div className={styles.emptyStateIcon}>
                  <DollarSign className="w-8 h-8" />
                </div>
                <h3 className={styles.emptyStateTitle}>No transactions found</h3>
                <p className={styles.emptyStateDescription}>
                  {hasActiveFilters
                    ? 'No transactions match your current filters. Try adjusting your search or filter criteria.'
                    : 'You currently have no transactions. Completed transactions will appear here.'}
                </p>
                {hasActiveFilters && (
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