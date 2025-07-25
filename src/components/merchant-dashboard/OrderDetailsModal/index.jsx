'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, User, MapPin, CreditCard, Calendar, Truck, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!order || !isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">#{order.orderId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                order.source === 'razorpay' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {order.source === 'razorpay' ? 'Razorpay' : 'Shiprocket'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Order Date</span>
                </div>
                <p className="font-semibold">{formatDate(order.orderDate || order.createdAt)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Total Amount</span>
                </div>
                <p className="font-semibold text-lg">{formatCurrency(order.total)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Payment Status</span>
                </div>
                <div className="flex gap-2">
                  {order.paymentStatus === 'paid_online' && (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-medium">
                      Paid Online
                    </span>
                  )}
                  {order.paymentStatus === 'cod' && (
                    <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 font-medium">
                      Cash on Delivery
                    </span>
                  )}
                  {order.paymentStatus === 'pending' && (
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 font-medium">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.customerName || 'N/A'}</p>
                </div>
                {order.customerEmail && order.customerEmail !== 'N/A' && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                )}
                {order.customerPhone && order.customerPhone !== 'N/A' && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.total || (item.quantity * item.price))}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="text-sm space-y-1">
                    {order.shippingAddress.address && <p>{order.shippingAddress.address}</p>}
                    {order.shippingAddress.city && (
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                    )}
                    {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  </div>
                </div>
              )}

              {/* Billing Address */}
              {order.billingAddress && Object.keys(order.billingAddress).length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Billing Address
                  </h3>
                  <div className="text-sm space-y-1">
                    {order.billingAddress.address && <p>{order.billingAddress.address}</p>}
                    {order.billingAddress.city && (
                      <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.pincode}</p>
                    )}
                    {order.billingAddress.country && <p>{order.billingAddress.country}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Details (for Shiprocket orders) */}
            {order.source === 'shiprocket' && (order.courierName || order.awbCode) && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.courierName && (
                    <div>
                      <p className="text-sm text-gray-500">Courier</p>
                      <p className="font-medium">{order.courierName}</p>
                    </div>
                  )}
                  {order.awbCode && (
                    <div>
                      <p className="text-sm text-gray-500">AWB Code</p>
                      <p className="font-medium">{order.awbCode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Razorpay Details */}
            {order.source === 'razorpay' && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Razorpay Order ID</p>
                    <p className="font-medium font-mono text-sm">{order.razorpayOrderId || order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">{order.currency || 'INR'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
