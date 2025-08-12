import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      // Coupon state
      appliedCoupon: null,
      couponDiscount: 0,
      availableCoupons: [
        {
          code: 'WINNER2024',
          type: 'percentage',
          value: 15,
          description: '15% off for quiz winners',
          minOrderValue: 100,
          maxDiscount: 500,
          isActive: true
        },
        {
          code: 'FASHIONLOVER',
          type: 'percentage', 
          value: 10,
          description: '10% off on fashion items',
          minOrderValue: 200,
          maxDiscount: 300,
          isActive: true
        },
        {
          code: 'WELCOME50',
          type: 'fixed',
          value: 50,
          description: '₹50 off on your first order',
          minOrderValue: 150,
          maxDiscount: 50,
          isActive: true
        }
      ],
      
      // Add item to cart
      addToCart: (product) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
      },
      
      // Remove item from cart
      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
      },
      
      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },
      
      // Clear cart
      clearCart: () => set({ items: [] }),
      
      // Toggle cart sidebar
      toggleCart: () => set({ isOpen: !get().isOpen }),
      
      // Open cart
      openCart: () => set({ isOpen: true }),
      
      // Close cart
      closeCart: () => set({ isOpen: false }),
      
      // Get cart total
      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
      },
      
      // Get cart items count
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Coupon functions
      applyCoupon: (couponCode) => {
        const { availableCoupons } = get();
        const coupon = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive);
        
        if (!coupon) {
          return { success: false, error: 'Invalid or expired coupon code' };
        }
        
        const cartTotal = get().getCartTotal();
        
        if (cartTotal < coupon.minOrderValue) {
          return { 
            success: false, 
            error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` 
          };
        }
        
        let discount = 0;
        if (coupon.type === 'percentage') {
          discount = (cartTotal * coupon.value) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else if (coupon.type === 'fixed') {
          discount = coupon.value;
        }
        
        set({ 
          appliedCoupon: coupon,
          couponDiscount: discount
        });
        
        return { success: true, discount, coupon };
      },
      
      removeCoupon: () => {
        set({ 
          appliedCoupon: null,
          couponDiscount: 0
        });
      },
      
      // Get final total after discount
      getFinalTotal: () => {
        const cartTotal = get().getCartTotal();
        const { couponDiscount } = get();
        return Math.max(0, cartTotal - couponDiscount);
      },
      
      // Check if coupon is valid
      validateCoupon: (couponCode) => {
        const { availableCoupons } = get();
        const coupon = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
        
        if (!coupon) return { valid: false, error: 'Coupon not found' };
        if (!coupon.isActive) return { valid: false, error: 'Coupon has expired' };
        
        const cartTotal = get().getCartTotal();
        if (cartTotal < coupon.minOrderValue) {
          return { 
            valid: false, 
            error: `Minimum order value of ₹${coupon.minOrderValue} required` 
          };
        }
        
        return { valid: true, coupon };
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useCartStore;
