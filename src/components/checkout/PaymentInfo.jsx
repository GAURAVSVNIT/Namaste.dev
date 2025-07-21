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
    <div className="payment-method-container">
      <div className="payment-method-options">
        <div 
          className={`payment-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('cod')}
        >
          <div className="payment-method-radio"></div>
          <div className="payment-method-content">
            <div className="payment-method-icon">
              <Truck className="w-5 h-5" />
            </div>
            <div className="payment-method-details">
              <div className="payment-method-name">Cash on Delivery</div>
              <div className="payment-method-description">Pay when delivered</div>
            </div>
          </div>
        </div>
        
        <div 
          className={`payment-method-option ${paymentMethod === 'online' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('online')}
        >
          <div className="payment-method-radio"></div>
          <div className="payment-method-content">
            <div className="payment-method-icon">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="payment-method-details">
              <div className="payment-method-name">Pay Online</div>
              <div className="payment-method-description">Secure payment gateway</div>
            </div>
          </div>
        </div>
      </div>
      
      {paymentMethod === 'online' && (
        <div className="payment-form-section">
          <div className="payment-form-title">
            <CreditCard className="w-5 h-5" />
            Secure Online Payment
          </div>
          <p className="text-sm text-blue-600 mb-3">
            You will be redirected to Razorpay's secure payment gateway where you can pay using:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-blue-600">
            <div>• Credit/Debit Cards</div>
            <div>• UPI Payments</div>
            <div>• Net Banking</div>
            <div>• Digital Wallets</div>
          </div>
          <div className="payment-security-info">
            <CreditCard className="w-4 h-4" />
            <span>256-bit SSL encryption ensures your payment is secure</span>
          </div>
        </div>
      )}
      
      {paymentMethod === 'cod' && (
        <div className="cod-info-box">
          <div className="cod-info-title">
            <Truck className="w-4 h-4" />
            Cash on Delivery Information
          </div>
          <p className="cod-info-text">
            Pay in cash when your order is delivered to your doorstep. Additional COD charges may apply based on your location and courier partner.
          </p>
        </div>
      )}
    </div>
  );
}, areEqual);

export default PaymentInfo;
