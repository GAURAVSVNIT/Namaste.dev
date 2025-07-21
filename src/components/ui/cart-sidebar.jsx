'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Button } from './button';
import useCartStore from '../../store/cart-store';
import useCheckoutStore from '../../store/checkout-store';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '../../lib/utils';
import './CartSidebar.css';

const CartSidebar = () => {
  const router = useRouter();
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCartStore();
  
  const { setOrderItems } = useCheckoutStore();

  const total = getCartTotal();
  const itemCount = getCartCount();

  const handleCheckout = () => {
    setOrderItems(items, 'cart');
    router.push('/checkout');
    closeCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1010]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="cart-sidebar fixed right-0 top-0 h-full w-full max-w-md shadow-2xl z-[1020] flex flex-col"
          >
            <div className="cart-header flex items-center justify-between">
              <h2 className="cart-header-title">
                Your Cart ({itemCount})
              </h2>
              <Button variant="ghost" size="icon" onClick={closeCart} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="cart-body">
              {items.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag className="icon" />
                  <h3>Your cart is empty</h3>
                  <p>Looks like you haven't added anything to your cart yet.</p>
                  <Button onClick={closeCart} size="lg" className="rounded-full">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.image || '/api/placeholder/80/80'}
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <p className="cart-item-price">{formatCurrency(item.price)}</p>
                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="quantity-value">{item.quantity}</span>
                            <button
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                       <button onClick={() => removeFromCart(item.id)} className="remove-btn self-start">
                          <Trash2 size={16} />
                        </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="subtotal-row">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-value">{formatCurrency(total)}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Total</span>
                  <span className="total-value">{formatCurrency(total)}</span>
                </div>
                
                <button onClick={handleCheckout} className="checkout-btn">
                  Proceed to Checkout <ArrowRight size={20} />
                </button>
                <Button variant="link" className="clear-cart-btn" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
