'use client';

import { useEffect, useState } from 'react';
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
      const newOrder = await processOrder();
      if (orderType === 'cart') {
        clearCart();
      }
    } catch (error) {
      console.error('Order placement failed:', error);
    }
  };


  // Step 1: Order Review
  const OrderReview = () => (
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
  );

  // Step 2: Shipping Information
  const ShippingInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Truck className="w-5 h-5" />
        <h2 className="text-2xl font-semibold">Shipping Information</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={shippingAddress.firstName}
            onChange={(e) => setShippingAddress({ firstName: e.target.value })}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={shippingAddress.lastName}
            onChange={(e) => setShippingAddress({ lastName: e.target.value })}
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
            onChange={(e) => setShippingAddress({ email: e.target.value })}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={shippingAddress.phone}
            onChange={(e) => setShippingAddress({ phone: e.target.value })}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={shippingAddress.address}
            onChange={(e) => setShippingAddress({ address: e.target.value })}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress({ city: e.target.value })}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={shippingAddress.state}
            onChange={(e) => setShippingAddress({ state: e.target.value })}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">PIN Code</Label>
          <Input
            id="zipCode"
            value={shippingAddress.zipCode}
            onChange={(e) => setShippingAddress({ zipCode: e.target.value })}
            className={errors.zipCode ? 'border-red-500' : ''}
          />
          {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
        </div>
      </div>
    </div>
  );

  // Step 3: Payment
  const PaymentInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="w-5 h-5" />
        <h2 className="text-2xl font-semibold">Payment Information</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card">Credit/Debit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi">UPI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="netbanking" id="netbanking" />
              <Label htmlFor="netbanking">Net Banking</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod">Cash on Delivery</Label>
            </div>
          </RadioGroup>
        </div>
        
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({ cardNumber: e.target.value })}
                className={errors.cardNumber ? 'border-red-500' : ''}
              />
              {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails({ expiryDate: e.target.value })}
                  className={errors.expiryDate ? 'border-red-500' : ''}
                />
                {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails({ cvv: e.target.value })}
                  className={errors.cvv ? 'border-red-500' : ''}
                />
                {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                value={paymentDetails.nameOnCard}
                onChange={(e) => setPaymentDetails({ nameOnCard: e.target.value })}
                className={errors.nameOnCard ? 'border-red-500' : ''}
              />
              {errors.nameOnCard && <p className="text-sm text-red-500">{errors.nameOnCard}</p>}
            </div>
          </div>
        )}
        
        {paymentMethod === 'upi' && (
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={paymentDetails.upiId || ''}
              onChange={(e) => setPaymentDetails({ upiId: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Step 4: Order Confirmation
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
        <Button onClick={() => router.push('/marketplace')} className="w-full">
          Continue Shopping
        </Button>
        <Button variant="outline" onClick={() => router.push('/profile')} className="w-full">
          View Orders
        </Button>
      </div>
    </div>
  );

  // Order Summary Sidebar
  const OrderSummary = () => (
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
  );

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
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <OrderReview />}
              {currentStep === 2 && <ShippingInfo />}
              {currentStep === 3 && <PaymentInfo />}
              {currentStep === 4 && <OrderConfirmation />}
            </motion.div>
            
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
