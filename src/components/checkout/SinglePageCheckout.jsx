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
  Clock
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
import Image from 'next/image';

const SinglePageCheckout = ({ onBack }) => {
  const [mounted, setMounted] = useState(false);
  
  const {
    orderItems,
    orderType,
    shippingAddress,
    paymentMethod,
    paymentDetails,
    subtotal,
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
          const shiprocketResponse = await fetch('/api/shiprocket/create-order', {
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
                const shiprocketResponse = await fetch('/api/shiprocket/create-order', {
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
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-green-600 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600">Your order has been placed successfully.</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Order ID:</strong> {order?.id}
        </p>
        <p className="text-sm text-green-800">
          <strong>Total:</strong> {formatCurrency(order?.total || 0)}
        </p>
        <p className="text-sm text-green-800">
          <strong>Estimated Delivery:</strong> {order?.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}
        </p>
      </div>
      
      <div className="space-y-2">
        <Button onClick={() => window.location.href = '/marketplace'} className="w-full">
          Continue Shopping
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/profile'} className="w-full">
          View Orders
        </Button>
      </div>
    </div>
  );

  if (order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <OrderConfirmation />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Customer Information */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleShippingAddressChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleShippingAddressChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleShippingAddressChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    value={shippingAddress.address}
                    onChange={(e) => handleShippingAddressChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">PIN Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentInfo
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  paymentDetails={paymentDetails}
                  handlePaymentDetailsChange={handlePaymentDetailsChange}
                  errors={errors}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Summary and Shipping */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                  <Badge variant="secondary" className="ml-auto">
                    {orderItems.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.image || '/api/placeholder/64/64'}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-600">{item.category}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            <ShippingRates
              orderItems={orderItems}
              onShippingSelect={handleShippingSelect}
              selectedShipping={selectedShipping}
            />

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping > 0 ? formatCurrency(shipping) : 'Free'}</span>
                  </div>
                  {selectedShipping && paymentMethod === 'cod' && selectedShipping.cod_charges > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>COD Charges</span>
                      <span>+{formatCurrency(selectedShipping.cod_charges)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                {subtotal < 500 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Add {formatCurrency(500 - subtotal)} more for free shipping!
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedShipping}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  {isProcessing && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing...' : `Place Order - ${formatCurrency(total)}`}
                  </span>
                </Button>

                {selectedShipping && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-800">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePageCheckout;
