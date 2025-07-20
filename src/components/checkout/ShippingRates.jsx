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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter your PIN code to see shipping options</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Fetching shipping rates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !serviceable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">
              {error || `Delivery not available to PIN code ${shippingAddress.zipCode}`}
            </p>
            <Button onClick={fetchShippingRates} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Options
          <Badge variant="secondary" className="ml-auto">
            {shippingOptions.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedShipping?.id} 
          onValueChange={handleShippingSelect}
          className="space-y-3"
        >
          {shippingOptions.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                selectedShipping?.id === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleShippingSelect(option.id)}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={option.id} className="mt-1" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{option.courier_name}</h3>
                    {option.recommend && (
                      <Badge variant="default" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                    {option.service_type === 'Express' && (
                      <Badge variant="secondary" className="text-xs">
                        Express
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getDeliveryEstimate(option.estimated_delivery_days)}</span>
                    </div>
                    
                    {option.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{option.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {option.tracking_available && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">Tracking</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {formatCurrency(option.total_charge)}
                        </span>
                        {option.cod_charges > 0 && paymentMethod === 'cod' && (
                          <span className="text-xs text-gray-500">
                            (incl. COD ₹{option.cod_charges})
                          </span>
                        )}
                      </div>
                      
                      {option.delivery_performance > 0 && (
                        <div className="text-xs text-gray-500">
                          {option.delivery_performance}% on-time delivery
                        </div>
                      )}
                    </div>
                    
                    {selectedShipping?.id === option.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </RadioGroup>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>All shipments are insured and tracked</span>
          </div>
          {paymentMethod === 'cod' && (
            <div className="mt-1 text-xs text-gray-500">
              COD charges may apply based on courier partner
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingRates;
