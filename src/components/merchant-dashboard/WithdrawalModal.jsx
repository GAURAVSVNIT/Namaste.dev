'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function WithdrawalModal({ isOpen, onClose, availableBalance }) {
  const { dispatch } = useDashboard();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const withdrawal = {
      id: `WD-${Date.now()}`,
      type: 'withdrawal',
      amount: parseFloat(amount),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: `Withdrawal via ${method}`
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: withdrawal });
    
    setAmount('');
    setMethod('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Request Withdrawal</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Available Balance */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Available Balance</p>
                        <p className="text-2xl font-bold text-blue-900">
                          ${availableBalance.toLocaleString()}
                        </p>
                      </div>
                      <Banknote className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Withdrawal Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    max={availableBalance}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Minimum withdrawal: $50.00
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={method} onValueChange={setMethod} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Processing Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Processing Time</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Bank Transfer: 3-5 business days</li>
                    <li>• PayPal: 1-2 business days</li>
                    <li>• Stripe: 1-3 business days</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!amount || !method || parseFloat(amount) > availableBalance}
                  >
                    Request Withdrawal
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}