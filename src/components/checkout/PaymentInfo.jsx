import React, { memo } from 'react';
import { CreditCard, Truck, Smartphone } from 'lucide-react';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent } from '../ui/card';

// Approach with custom comparator function
const areEqual = (prevProps, nextProps) => {
  // Check if paymentMethod has changed
  if (prevProps.paymentMethod !== nextProps.paymentMethod) {
    return false;
  }
  // Check if paymentDetails have changed
  if (JSON.stringify(prevProps.paymentDetails) !== JSON.stringify(nextProps.paymentDetails)) {
    return false;
  }
  // Check if errors have changed
  if (JSON.stringify(prevProps.errors) !== JSON.stringify(nextProps.errors)) {
    return false;
  }
  // Check if handler function reference has changed
  if (prevProps.handlePaymentDetailsChange !== nextProps.handlePaymentDetailsChange) {
    return false;
  }
  // Check if setPaymentMethod has changed
  if (prevProps.setPaymentMethod !== nextProps.setPaymentMethod) {
    return false;
  }
  return true;
};

const PaymentInfo = memo(({ paymentMethod, setPaymentMethod, paymentDetails, handlePaymentDetailsChange, errors }) => {
  return (
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
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod"><Truck className="w-4 h-4 inline-block mr-1" /> Cash on Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online"><Smartphone className="w-4 h-4 inline-block mr-1" /> Pay Online</Label>
            </div>
          </RadioGroup>
        </div>
        
        {paymentMethod === 'online' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-blue-700">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold">Secure Online Payment</h3>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                You will be redirected to Razorpay's secure payment gateway where you can pay using:
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Credit/Debit Cards</li>
                <li>• UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>• Net Banking</li>
                <li>• Wallets</li>
              </ul>
            </CardContent>
          </Card>
        )}
        
        {paymentMethod === 'cod' && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-amber-700">
                <Truck className="w-5 h-5" />
                <h3 className="font-semibold">Cash on Delivery</h3>
              </div>
              <p className="text-sm text-amber-600 mt-2">
                Pay in cash when your order is delivered to your doorstep.
              </p>
              <p className="text-sm text-amber-600">
                Additional ₹40 COD charges will be added to your order.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}, areEqual);

export default PaymentInfo;
