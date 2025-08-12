'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Package,
  Shield,
  Lock,
  Calculator,
  Clock,
  Tag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import useCheckoutStore from '../../store/checkout-store';
import useCartStore from '../../store/cart-store';
import { formatCurrency } from '../../lib/utils';
import ShippingRates from './ShippingRates';
import PaymentInfo from './PaymentInfo';
import CouponInput from '../marketplace/CouponInput';
import Image from 'next/image';
import './Checkout.css';

const SinglePageCheckout = ({ onBack }) => {
  const [mounted, setMounted] = useState(false);
  
  const {
    orderItems,
    orderType,
    shippingAddress,
    paymentMethod,
    paymentDetails,
    subtotal,
    couponDiscount,
    shipping,
    tax,
    total,
    isProcessing,
    errors,
    order,
    selectedShipping,
    setShippingAddress,
    setPaymentMethod,
    setPaymentDetails,
    validateShippingAddress,
    validatePaymentDetails,
    processOrder,
    setSelectedShipping,
    reset
  } = useCheckoutStore();
  
  const { items: cartItems, clearCart } = useCartStore();

  // Create stable handlers for form inputs
  const handleShippingAddressChange = useCallback((field, value) => {
    setShippingAddress({ [field]: value });
  }, [setShippingAddress]);

  const handlePaymentDetailsChange = useCallback((field, value) => {
    setPaymentDetails({ [field]: value });
  }, [setPaymentDetails]);

  const handleShippingSelect = useCallback((shippingOption) => {
    setSelectedShipping(shippingOption);
  }, [setSelectedShipping]);

  useEffect(() => {
    setMounted(true);
    
    // If no order items but cart has items, set cart items as order items
    if (!orderItems.length && cartItems.length) {
      const { setOrderItems } = useCheckoutStore.getState();
      setOrderItems(cartItems, 'cart');
    }
  }, [orderItems, cartItems]);

  if (!mounted) return null;

  const handlePlaceOrder = async () => {
    try {
      // Validate shipping address
      if (!validateShippingAddress()) {
        return;
      }

      // Validate payment details
      if (!validatePaymentDetails()) {
        return;
      }

      // Validate shipping selection
      if (!selectedShipping) {
        alert('Please select a shipping option');
        return;
      }

      // For COD orders, process directly without Razorpay
      if (paymentMethod === 'cod') {
        const newOrder = await processOrder();
        
        // Create Shiprocket order for COD as well
        try {
          const shiprocketResponse = await fetch('/api/merchant/shiprocket/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: newOrder.id,
              orderDate: newOrder.orderDate,
              billingAddress: shippingAddress,
              shippingAddress: null, // Using billing as shipping
              orderItems: orderItems,
              paymentMethod: paymentMethod,
              subTotal: subtotal,
              shippingDetails: selectedShipping
            })
          });
          
          if (shiprocketResponse.ok) {
            const shiprocketData = await shiprocketResponse.json();
            console.log('Shiprocket COD order created:', shiprocketData);
          } else {
            console.error('Failed to create Shiprocket COD order');
          }
        } catch (shiprocketError) {
          console.error('Shiprocket COD integration error:', shiprocketError);
        }
        
        if (orderType === 'cart') {
          clearCart();
        }
        return;
      }

      // For online payments, create Razorpay order first
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId: razorpayOrderId, amount } = await orderResponse.json();

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Namaste.dev Marketplace',
        description: `Order for ${orderItems.length} item(s)`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  orderItems,
                  shippingAddress,
                  paymentMethod,
                  total,
                  shippingDetails: selectedShipping
                }
              }),
            });

            if (verifyResponse.ok) {
              const verificationResult = await verifyResponse.json();
              // Payment verified successfully, now process the order
              const newOrder = await processOrder();
              
              // Create Shiprocket order after local order is created
              try {
                const shiprocketResponse = await fetch('/api/merchant/shiprocket/create-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    orderId: newOrder.id,
                    orderDate: newOrder.orderDate,
                    billingAddress: shippingAddress,
                    shippingAddress: null, // Using billing as shipping
                    orderItems: orderItems,
                    paymentMethod: paymentMethod,
                    subTotal: subtotal,
                    shippingDetails: selectedShipping
                  })
                });
                
                if (shiprocketResponse.ok) {
                  const shiprocketData = await shiprocketResponse.json();
                  console.log('Shiprocket order created:', shiprocketData);
                } else {
                  console.error('Failed to create Shiprocket order');
                }
              } catch (shiprocketError) {
                console.error('Shiprocket integration error:', shiprocketError);
              }
              
              if (orderType === 'cart') {
                clearCart();
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}`,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
          }
        }
      };

      // Check if Razorpay is loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }

    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  // Order confirmation component
  const OrderConfirmation = () => (
    <div className="checkout-order-confirmation">
      <div className="checkout-confirmation-icon">
        <CheckCircle />
      </div>
      
      <div>
        <h2 className="checkout-confirmation-title">Order Confirmed!</h2>
        <p className="checkout-confirmation-subtitle">Your order has been placed successfully.</p>
      </div>
      
      <div className="checkout-confirmation-details">
        <p className="checkout-confirmation-detail">
          <strong>Order ID:</strong> {order?.id}
        </p>
        <p className="checkout-confirmation-detail">
          <strong>Total:</strong> {formatCurrency(order?.total || 0)}
        </p>
        <p className="checkout-confirmation-detail">
          <strong>Estimated Delivery:</strong> {order?.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}
        </p>
      </div>
      
      <div className="checkout-confirmation-actions">
        <button 
          onClick={() => window.location.href = '/marketplace'} 
          className="checkout-confirmation-button primary"
        >
          Continue Shopping
        </button>
        <button 
          onClick={() => window.location.href = '/profile'} 
          className="checkout-confirmation-button secondary"
        >
          View Orders
        </button>
      </div>
    </div>
  );

  if (order) {
    return (
      <div className="checkout-container">
        <div className="checkout-wrapper">
          <OrderConfirmation />
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        {/* Header */}
        <div className="checkout-header">
          <button
            onClick={onBack}
            className="checkout-back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          
          <div className="checkout-title">
            <ShoppingCart className="checkout-title-icon" />
            <h1>Secure Checkout</h1>
          </div>
        </div>

        <div className="checkout-grid">
          {/* Left Side - Customer Information */}
          <div className="checkout-section">
            {/* Customer Details */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h3 className="checkout-card-title">
                  <User className="checkout-card-title-icon" />
                  Customer Information
                </h3>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-form-grid">
                  <div className="checkout-form-row">
                    <div className="checkout-form-group">
                      <label htmlFor="firstName" className="checkout-label">First Name</label>
                      <input
                        id="firstName"
                        className={`checkout-input ${errors.firstName ? 'error' : ''}`}
                        value={shippingAddress.firstName}
                        onChange={(e) => handleShippingAddressChange('firstName', e.target.value)}
                      />
                      {errors.firstName && <p className="checkout-input-error">{errors.firstName}</p>}
                    </div>
                    
                    <div className="checkout-form-group">
                      <label htmlFor="lastName" className="checkout-label">Last Name</label>
                      <input
                        id="lastName"
                        className={`checkout-input ${errors.lastName ? 'error' : ''}`}
                        value={shippingAddress.lastName}
                        onChange={(e) => handleShippingAddressChange('lastName', e.target.value)}
                      />
                      {errors.lastName && <p className="checkout-input-error">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div className="checkout-form-row">
                    <div className="checkout-form-group">
                      <label htmlFor="email" className="checkout-label">Email</label>
                      <input
                        id="email"
                        type="email"
                        className={`checkout-input ${errors.email ? 'error' : ''}`}
                        value={shippingAddress.email}
                        onChange={(e) => handleShippingAddressChange('email', e.target.value)}
                      />
                      {errors.email && <p className="checkout-input-error">{errors.email}</p>}
                    </div>
                    
                    <div className="checkout-form-group">
                      <label htmlFor="phone" className="checkout-label">Phone</label>
                      <input
                        id="phone"
                        className={`checkout-input ${errors.phone ? 'error' : ''}`}
                        value={shippingAddress.phone}
                        onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                      />
                      {errors.phone && <p className="checkout-input-error">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h3 className="checkout-card-title">
                  <MapPin className="checkout-card-title-icon" />
                  Shipping Address
                </h3>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-form-grid">
                  <div className="checkout-form-group">
                    <label htmlFor="address" className="checkout-label">Address</label>
                    <textarea
                      id="address"
                      className={`checkout-textarea ${errors.address ? 'error' : ''}`}
                      placeholder="Enter your full address"
                      value={shippingAddress.address}
                      onChange={(e) => handleShippingAddressChange('address', e.target.value)}
                      rows={3}
                    />
                    {errors.address && <p className="checkout-input-error">{errors.address}</p>}
                  </div>
                  
                  <div className="checkout-form-row">
                    <div className="checkout-form-group">
                      <label htmlFor="city" className="checkout-label">City</label>
                      <input
                        id="city"
                        className={`checkout-input ${errors.city ? 'error' : ''}`}
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                      />
                      {errors.city && <p className="checkout-input-error">{errors.city}</p>}
                    </div>
                    
                    <div className="checkout-form-group">
                      <label htmlFor="state" className="checkout-label">State</label>
                      <input
                        id="state"
                        className={`checkout-input ${errors.state ? 'error' : ''}`}
                        value={shippingAddress.state}
                        onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                      />
                      {errors.state && <p className="checkout-input-error">{errors.state}</p>}
                    </div>
                  </div>
                  
                  <div className="checkout-form-group">
                    <label htmlFor="zipCode" className="checkout-label">PIN Code</label>
                    <input
                      id="zipCode"
                      className={`checkout-input ${errors.zipCode ? 'error' : ''}`}
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                    />
                    {errors.zipCode && <p className="checkout-input-error">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h3 className="checkout-card-title">
                  <CreditCard className="checkout-card-title-icon" />
                  Payment Method
                </h3>
              </div>
              <div className="checkout-card-content">
                <PaymentInfo
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  paymentDetails={paymentDetails}
                  handlePaymentDetailsChange={handlePaymentDetailsChange}
                  errors={errors}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary and Shipping */}
          <div className="checkout-section">
            {/* Order Items */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h3 className="checkout-card-title">
                  <Package className="checkout-card-title-icon" />
                  Order Items
                  <div className="checkout-badge ml-auto">
                    {orderItems.length} items
                  </div>
                </h3>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-items-scroll">
                  {orderItems.map((item) => (
                    <div key={item.id} className="checkout-order-item">
                      <img
                        src={item.image || '/api/placeholder/64/64'}
                        alt={item.name}
                        className="checkout-order-item-image"
                      />
                      <div className="checkout-order-item-details">
                        <h4 className="checkout-order-item-name">{item.name}</h4>
                        <p className="checkout-order-item-meta">{item.category}</p>
                        <p className="checkout-order-item-meta">Qty: {item.quantity}</p>
                      </div>
                      <div className="checkout-order-item-price">
                        <p className="checkout-order-item-total">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="checkout-order-item-unit">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Options */}
            <ShippingRates
              orderItems={orderItems}
              onShippingSelect={handleShippingSelect}
              selectedShipping={selectedShipping}
            />

            {/* Coupon Code Section */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h3 className="checkout-card-title">
                  <Tag className="checkout-card-title-icon" />
                  Apply Coupon Code
                </h3>
              </div>
              <div className="checkout-card-content">
                <CouponInput />
              </div>
            </div>

            {/* Order Summary */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h3 className="checkout-card-title">
                  <Calculator className="checkout-card-title-icon" />
                  Order Summary
                </h3>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-label">Subtotal</span>
                    <span className="checkout-summary-value">{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="checkout-summary-row">
                      <span className="checkout-summary-label">Coupon Discount</span>
                      <span className="checkout-summary-value" style={{ color: '#16a34a' }}>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-label">Shipping</span>
                    <span className="checkout-summary-value">{shipping > 0 ? formatCurrency(shipping) : 'Free'}</span>
                  </div>
                  {selectedShipping && paymentMethod === 'cod' && selectedShipping.cod_charges > 0 && (
                    <div className="checkout-summary-row">
                      <span className="checkout-summary-label">COD Charges</span>
                      <span className="checkout-summary-value">+{formatCurrency(selectedShipping.cod_charges)}</span>
                    </div>
                  )}
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-label">GST (18%)</span>
                    <span className="checkout-summary-value">{formatCurrency(tax)}</span>
                  </div>
                  <div className="checkout-summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                {subtotal < 500 && (
                  <div className="checkout-shipping-notice">
                    <p className="checkout-shipping-notice-text">
                      Add {formatCurrency(500 - subtotal)} more for free shipping!
                    </p>
                  </div>
                )}
                
                <div className="checkout-security-notice">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedShipping}
                  className="checkout-place-order-button"
                >
                  {isProcessing && <div className="spinner" />}
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing...' : `Place Order - ${formatCurrency(total)}`}
                  </span>
                </button>

                {selectedShipping && (
                  <div className="checkout-delivery-info">
                    <div className="checkout-delivery-text">
                      <Clock className="w-4 h-4" />
                      <span>
                        Estimated delivery in {selectedShipping.estimated_delivery_days} {
                          typeof selectedShipping.estimated_delivery_days === 'number' && 
                          selectedShipping.estimated_delivery_days === 1 ? 'day' : 'days'
                        } via {selectedShipping.courier_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePageCheckout;
