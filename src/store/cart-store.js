import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
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
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useCartStore;
