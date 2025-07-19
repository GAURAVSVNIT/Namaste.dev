'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
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
  Edit,
  Lock,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import useCheckoutStore from '../../store/checkout-store';
import useCartStore from '../../store/cart-store';
import { formatCurrency } from '../../lib/utils';
import ShippingForm from '../../components/checkout/ShippingForm';
import PaymentInfo from '../../components/checkout/PaymentInfo';

const CheckoutPage = () => {
  const router = useRouter();
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
    currentStep,
    isProcessing,
    errors,
    order,
    setShippingAddress,
    setPaymentMethod,
    setPaymentDetails,
    setCurrentStep,
    validateShippingAddress,
    validatePaymentDetails,
    processOrder,
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

  // All useCallback hooks must be at the top level
  const OrderReview = useCallback(() => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Review Your Order</h2>
        <Badge variant="outline" className="text-sm">
          {orderItems.length} item{orderItems.length > 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
            <img
              src={item.image || '/api/placeholder/80/80'}
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.category}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [orderItems]);

  const ShippingInfo = () => <ShippingForm />;


  const OrderConfirmation = useCallback(() => (
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
        <Button onClick={() => router.push('/marketplace')} className="w-full">
          Continue Shopping
        </Button>
        <Button variant="outline" onClick={() => router.push('/profile')} className="w-full">
          View Orders
        </Button>
      </div>
    </div>
  ), [order, router]);

  const OrderSummary = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
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
      </CardContent>
    </Card>
  ), [subtotal, shipping, tax, total]);

  useEffect(() => {
    setMounted(true);
    
    // If no order items but cart has items, set cart items as order items
    if (!orderItems.length && cartItems.length) {
      const { setOrderItems } = useCheckoutStore.getState();
      setOrderItems(cartItems, 'cart');
    }
    
    // If no items and no order items, redirect to marketplace
    if (!orderItems.length && !cartItems.length) {
      router.push('/marketplace');
    }
  }, [orderItems, cartItems, router]);

  if (!mounted) return null;

  // Step navigation
  const nextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateShippingAddress()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validatePaymentDetails()) {
        handlePlaceOrder();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // For COD orders, process directly without Razorpay
      if (paymentMethod === 'cod') {
        const newOrder = await processOrder();
        if (orderType === 'cart') {
          clearCart();
        }
        setCurrentStep(4);
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
          orderItems,
          shippingAddress,
          paymentMethod,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { razorpayOrderId, amount } = await orderResponse.json();

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
                  total
                }
              }),
            });

            if (verifyResponse.ok) {
              const verifiedOrder = await verifyResponse.json();
              // Update checkout store with the verified order
              useCheckoutStore.getState().setOrder(verifiedOrder);
              
              if (orderType === 'cart') {
                clearCart();
              }
              setCurrentStep(4);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function() {
            // Payment cancelled by user
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/marketplace')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrderReview />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShippingForm />
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentInfo
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    paymentDetails={paymentDetails}
                    handlePaymentDetailsChange={handlePaymentDetailsChange}
                    errors={errors}
                  />
                </motion.div>
              )}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrderConfirmation />
                </motion.div>
              )}
            </div>
            
            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  {isProcessing && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                  <span>
                    {currentStep === 3 ? 'Place Order' : 'Next'}
                  </span>
                </Button>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
