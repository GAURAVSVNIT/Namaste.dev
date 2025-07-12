'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, CreditCard, TrendingUp } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/merchant-dashboard/StatsCard';
import { WithdrawalModal } from '@/components/merchant-dashboard/WithdrawalModal';

export default function PaymentsPage() {
  const { state } = useDashboard();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const totalEarnings = state.transactions
    .filter(t => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawals = state.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return '↗️';
      case 'withdrawal': return '↙️';
      case 'refund': return '↩️';
      default: return '💰';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage your earnings and withdrawals</p>
        </div>
        <Button 
          onClick={() => setIsWithdrawalModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Request Withdrawal
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          change="+12% from last month"
          trend="up"
          delay={0.1}
        />
        <StatsCard
          title="Available Balance"
          value={`$${(totalEarnings - pendingWithdrawals).toLocaleString()}`}
          icon={CreditCard}
          change="+8% from last month"
          trend="up"
          delay={0.2}
        />
        <StatsCard
          title="Pending Withdrawals"
          value={`$${pendingWithdrawals.toLocaleString()}`}
          icon={Download}
          change="2 requests"
          delay={0.3}
        />
        <StatsCard
          title="This Month"
          value={`$${(totalEarnings * 0.3).toLocaleString()}`}
          icon={TrendingUp}
          change="+25% from last month"
          trend="up"
          delay={0.4}
        />
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'sale' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        availableBalance={totalEarnings - pendingWithdrawals}
      />
    </div>
  );
}