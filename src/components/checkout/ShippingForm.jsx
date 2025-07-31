'use client';

import { memo, useCallback } from 'react';
import { Truck } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import useCheckoutStore from '../../store/checkout-store';

const ShippingForm = memo(() => {
  const { shippingAddress, errors, setShippingAddress } = useCheckoutStore();
  
  const handleChange = useCallback((field, value) => {
    setShippingAddress({ [field]: value });
  }, [setShippingAddress]);

  return (
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
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={shippingAddress.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
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
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={shippingAddress.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={shippingAddress.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={shippingAddress.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={shippingAddress.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">PIN Code</Label>
          <Input
            id="zipCode"
            value={shippingAddress.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className={errors.zipCode ? 'border-red-500' : ''}
          />
          {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
        </div>
      </div>
    </div>
  );
});

ShippingForm.displayName = 'ShippingForm';

export default ShippingForm;
