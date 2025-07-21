'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, Star, CheckCircle, Loader, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils';
import useCheckoutStore from '../../store/checkout-store';

const ShippingRates = ({ orderItems = [], onShippingSelect, selectedShipping }) => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceable, setServiceable] = useState(true);

  const { shippingAddress, paymentMethod } = useCheckoutStore();

  const fetchShippingRates = async () => {
    if (!shippingAddress.zipCode || shippingAddress.zipCode.length < 6) {
      setShippingOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const codAmount = paymentMethod === 'cod' ? orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
      
      const response = await fetch('/api/shiprocket/shipping-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pincode: shippingAddress.zipCode,
          codAmount,
          items: orderItems.map(item => ({
            ...item,
            weight: item.weight || 0.5 // Default weight per item
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        setShippingOptions(data.data.shipping_options || []);
        setServiceable(data.data.serviceable);
        
        // Auto-select the first recommended option or cheapest option
        if (data.data.shipping_options && data.data.shipping_options.length > 0) {
          const recommendedOption = data.data.shipping_options.find(option => option.recommend) || data.data.shipping_options[0];
          onShippingSelect(recommendedOption);
        }
      } else {
        setError(data.error || 'Failed to fetch shipping rates');
        setServiceable(false);
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      setError('Failed to fetch shipping rates. Please try again.');
      setServiceable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingRates();
  }, [shippingAddress.zipCode, paymentMethod, orderItems]);

  const handleShippingSelect = (optionId) => {
    const selectedOption = shippingOptions.find(option => option.id === optionId);
    if (selectedOption) {
      onShippingSelect(selectedOption);
    }
  };

  const getDeliveryEstimate = (days) => {
    if (typeof days === 'string') return days;
    
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + parseInt(days));
    
    return `${days} ${parseInt(days) === 1 ? 'day' : 'days'} (by ${deliveryDate.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short' 
    })})`;
  };

  if (!shippingAddress.zipCode || shippingAddress.zipCode.length < 6) {
    return (
      <div className="checkout-card">
        <div className="checkout-card-header">
          <h3 className="checkout-card-title">
            <Truck className="checkout-card-title-icon" />
            Shipping Options
          </h3>
        </div>
        <div className="checkout-card-content">
          <div className="text-center py-8 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter your PIN code to see shipping options</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkout-card">
        <div className="checkout-card-header">
          <h3 className="checkout-card-title">
            <Truck className="checkout-card-title-icon" />
            Shipping Options
          </h3>
        </div>
        <div className="checkout-card-content">
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Fetching shipping rates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !serviceable) {
    return (
      <div className="checkout-card">
        <div className="checkout-card-header">
          <h3 className="checkout-card-title">
            <Truck className="checkout-card-title-icon" />
            Shipping Options
          </h3>
        </div>
        <div className="checkout-card-content">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">
              {error || `Delivery not available to PIN code ${shippingAddress.zipCode}`}
            </p>
            <Button onClick={fetchShippingRates} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-card">
      <div className="checkout-card-header">
        <h3 className="checkout-card-title">
          <Truck className="checkout-card-title-icon" />
          Shipping Options
          <div className="checkout-badge ml-auto">
            {shippingOptions.length} available
          </div>
        </h3>
      </div>
      <div className="checkout-card-content">
        <div className="shipping-options-container">
          {shippingOptions.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`shipping-option ${selectedShipping?.id === option.id ? 'selected' : ''}`}
              onClick={() => handleShippingSelect(option.id)}
            >
              <div className="shipping-option-radio"></div>
              
              <div className="shipping-option-content">
                <div className="shipping-option-details">
                  <div className="shipping-option-name">
                    {option.courier_name}
                    {option.recommend && (
                      <div className="shipping-option-badge recommended">
                        Recommended
                      </div>
                    )}
                    {option.service_type === 'Express' && (
                      <div className="shipping-option-badge fastest">
                        Express
                      </div>
                    )}
                  </div>
                  
                  <div className="shipping-option-courier">
                    {option.service_type || 'Standard Service'}
                  </div>
                  
                  <div className="shipping-option-delivery">
                    <Clock className="w-3 h-3" />
                    <span>{getDeliveryEstimate(option.estimated_delivery_days)}</span>
                  </div>
                  
                  {option.rating > 0 && (
                    <div className="shipping-option-rating">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>{option.rating.toFixed(1)} rating</span>
                      {option.delivery_performance > 0 && (
                        <span>• {option.delivery_performance}% on-time</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="shipping-option-price">
                  <div className={`shipping-option-cost ${option.total_charge === 0 ? 'free' : ''}`}>
                    {option.total_charge === 0 ? 'FREE' : formatCurrency(option.total_charge)}
                  </div>
                  {option.cod_charges > 0 && paymentMethod === 'cod' && (
                    <div className="shipping-option-rating">
                      COD: +₹{option.cod_charges}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedShipping?.id === option.id && (
                <CheckCircle className="w-5 h-5 text-blue-600 absolute top-4 right-4" />
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="checkout-security-notice mt-4">
          <Shield className="w-4 h-4" />
          <span>All shipments are insured and tracked for your security</span>
        </div>
        {paymentMethod === 'cod' && (
          <div className="cod-info-box">
            <div className="cod-info-title">
              <AlertCircle className="w-4 h-4" />
              Cash on Delivery Info
            </div>
            <p className="cod-info-text">
              Additional COD charges may apply based on courier partner and delivery location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingRates;
