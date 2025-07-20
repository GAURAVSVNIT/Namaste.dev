import { create } from 'zustand';
import { calculateGST, calculateShipping, calculateTotal, generateOrderId } from '../lib/utils';

const useCheckoutStore = create((set, get) => ({
  // Order details
  orderItems: [],
  orderType: 'cart', // 'cart' or 'buy-now'
  
  // Shipping information
  shippingAddress: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN'
  },
  
  // Payment information
  paymentMethod: 'cod', // 'cod', 'online'
  paymentDetails: {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  },
  
  // Order summary
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  selectedShipping: null,
  
  // UI state
  currentStep: 1, // 1: Review, 2: Shipping, 3: Payment, 4: Confirmation
  isProcessing: false,
  errors: {},
  
  // Actions
  setOrderItems: (items, type = 'cart') => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShipping(subtotal);
    const tax = calculateGST(subtotal);
    const total = calculateTotal(subtotal, shipping, tax);
    
    set({
      orderItems: items,
      orderType: type,
      subtotal,
      shipping,
      tax,
      total
    });
  },
  
  setShippingAddress: (address) => {
    set((state) => ({
      shippingAddress: { ...state.shippingAddress, ...address }
    }));
  },
  
  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },
  
  setPaymentDetails: (details) => {
    set((state) => ({
      paymentDetails: { ...state.paymentDetails, ...details }
    }));
  },
  
  setCurrentStep: (step) => {
    set({ currentStep: step });
  },
  
  setProcessing: (isProcessing) => {
    set({ isProcessing });
  },
  
  setErrors: (errors) => {
    set({ errors });
  },
  
  setOrder: (order) => {
    set({ order });
  },
  
  // Validation
  validateShippingAddress: () => {
    const { shippingAddress } = get();
    const errors = {};
    
    if (!shippingAddress.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) errors.email = 'Email is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone is required';
    if (!shippingAddress.address.trim()) errors.address = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) errors.zipCode = 'PIN code is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingAddress.email && !emailRegex.test(shippingAddress.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (shippingAddress.phone && !phoneRegex.test(shippingAddress.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    set({ errors });
    return Object.keys(errors).length === 0;
  },
  
  validatePaymentDetails: () => {
    const { paymentMethod } = get();
    const errors = {};
    
    // For simplified payment flow, no validation needed
    // COD and online payment don't require field validation
    if (!paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }
    
    set({ errors });
    return Object.keys(errors).length === 0;
  },
  
  // Process order
  processOrder: async () => {
    const { orderItems, shippingAddress, paymentDetails, paymentMethod, total } = get();
    
    set({ isProcessing: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const order = {
        id: generateOrderId(),
        items: orderItems,
        shippingAddress,
        paymentMethod,
        total,
        status: 'confirmed',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      set({ 
        currentStep: 4,
        isProcessing: false,
        order 
      });
      
      return order;
    } catch (error) {
      set({ 
        isProcessing: false,
        errors: { general: 'Failed to process order. Please try again.' }
      });
      throw error;
    }
  },
  
  // Reset store
  reset: () => {
    set({
      orderItems: [],
      orderType: 'cart',
      shippingAddress: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'IN'
      },
      paymentMethod: 'card',
      paymentDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
      },
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      selectedShipping: null,
      currentStep: 1,
      isProcessing: false,
      errors: {},
      order: null
    });
  },
  setSelectedShipping: (shipping) => {
    set((state) => {
      const shippingCharge = shipping ? shipping.total_charge : 0;
      const total = calculateTotal(state.subtotal, shippingCharge, state.tax);
      return {
        selectedShipping: shipping,
        shipping: shippingCharge,
        total,
      };
    });
  }
}));

export default useCheckoutStore;
