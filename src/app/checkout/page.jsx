'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useCheckoutStore from '../../store/checkout-store';
import useCartStore from '../../store/cart-store';
import SinglePageCheckout from '../../components/checkout/SinglePageCheckout';

const CheckoutPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { orderItems } = useCheckoutStore();
  const { items: cartItems } = useCartStore();

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

  const handleBackToMarketplace = () => {
    router.push('/marketplace');
  };

  return (
    <SinglePageCheckout onBack={handleBackToMarketplace} />
  );
};

export default CheckoutPage;
