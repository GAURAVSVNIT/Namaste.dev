'use client';

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

const useMerchantStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // User/Merchant Profile
        merchant: null,
        
        // Products
        products: [],
        totalProducts: 0,
        productCategories: ['Electronics', 'Clothing', 'Food', 'Books', 'Other'],
        
        // Orders
        orders: [],
        orderStatuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        
        // Analytics
        analytics: {
          totalRevenue: 0,
          todayRevenue: 0,
          weeklyRevenue: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0,
          totalOrders: 0,
          activeOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          topSellingProducts: [],
          recentActivity: []
        },
        
        // Chat & Support
        chatMessages: [],
        unreadMessages: 0,
        supportTickets: [],
        
        // Payments
        transactions: [],
        paymentMethods: [],
        withdrawals: [],
        
        // UI State
        loading: false,
        error: null,
        notifications: [],
        
        // Actions
        setMerchant: (merchant) => set({ merchant }),
        
        // Product Actions
        setProducts: (products) => set({ products, totalProducts: products.length }),
        addProduct: (product) => set((state) => ({
          products: [...state.products, product],
          totalProducts: state.totalProducts + 1
        })),
        updateProduct: (productId, updates) => set((state) => ({
          products: state.products.map(p => 
            p.id === productId ? { ...p, ...updates } : p
          )
        })),
        deleteProduct: (productId) => set((state) => ({
          products: state.products.filter(p => p.id !== productId),
          totalProducts: state.totalProducts - 1
        })),
        
        // Order Actions
        setOrders: (orders) => set({ orders }),
        addOrder: (order) => set((state) => ({
          orders: [order, ...state.orders]
        })),
        updateOrderStatus: (orderId, status) => set((state) => ({
          orders: state.orders.map(o => 
            o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
          )
        })),
        
        // Analytics Actions
        setAnalytics: (analytics) => set({ analytics }),
        updateAnalytics: (updates) => set((state) => ({
          analytics: { ...state.analytics, ...updates }
        })),
        
        // Chat Actions
        setChatMessages: (messages) => set({ chatMessages: messages }),
        addChatMessage: (message) => set((state) => ({
          chatMessages: [...state.chatMessages, message]
        })),
        setUnreadMessages: (count) => set({ unreadMessages: count }),
        
        // Payment Actions
        setTransactions: (transactions) => set({ transactions }),
        addTransaction: (transaction) => set((state) => ({
          transactions: [transaction, ...state.transactions]
        })),
        
        // Notification Actions
        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, {
            id: Date.now().toString(),
            timestamp: new Date(),
            ...notification
          }]
        })),
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
        
        // Loading & Error Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        // Clear all data
        clearStore: () => set({
          merchant: null,
          products: [],
          orders: [],
          analytics: {
            totalRevenue: 0,
            todayRevenue: 0,
            weeklyRevenue: 0,
            monthlyRevenue: 0,
            yearlyRevenue: 0,
            totalOrders: 0,
            activeOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            conversionRate: 0,
            averageOrderValue: 0,
            topSellingProducts: [],
            recentActivity: []
          },
          chatMessages: [],
          unreadMessages: 0,
          transactions: [],
          notifications: []
        }),
        
        // Computed values
        getOrdersByStatus: (status) => {
          return get().orders.filter(order => order.status === status);
        },
        
        getProductsByCategory: (category) => {
          return get().products.filter(product => product.category === category);
        },
        
        getTotalInventory: () => {
          return get().products.reduce((total, product) => total + (product.stock || 0), 0);
        },
        
        getRecentOrders: (limit = 5) => {
          return get().orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
        },
        
        getTopSellingProducts: (limit = 5) => {
          return get().products
            .sort((a, b) => (b.sold || 0) - (a.sold || 0))
            .slice(0, limit);
        }
      }),
      {
        name: 'merchant-dashboard-store',
        partialize: (state) => ({
          merchant: state.merchant,
          products: state.products,
          analytics: state.analytics,
          notifications: state.notifications
        })
      }
    )
  )
);

export default useMerchantStore;
