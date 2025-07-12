import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useMerchantStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      
      // Dashboard stats
      stats: {
        totalOrders: 0,
        revenue: 0,
        inventoryLeft: 0,
        conversionRate: 0,
        weeklyViews: 0,
        topSellingProducts: []
      },
      
      // Products state
      products: [],
      selectedProduct: null,
      
      // Orders state
      orders: [],
      
      // Analytics state
      analytics: {
        salesData: [],
        viewsData: [],
        revenueData: []
      },
      
      // Chat state
      messages: [],
      onlineUsers: [],
      
      // Payments state
      payments: {
        totalEarnings: 0,
        withdrawalRequests: [],
        payoutHistory: []
      },
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setStats: (stats) => set({ stats }),
      
      setProducts: (products) => set({ products }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: Date.now() }]
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      
      setOrders: (orders) => set({ orders }),
      
      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      })),
      
      setAnalytics: (analytics) => set({ analytics }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: Date.now() }]
      })),
      
      setMessages: (messages) => set({ messages }),
      
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      
      setPayments: (payments) => set({ payments }),
      
      addWithdrawalRequest: (request) => set((state) => ({
        payments: {
          ...state.payments,
          withdrawalRequests: [...state.payments.withdrawalRequests, {
            ...request,
            id: Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString()
          }]
        }
      }))
    }),
    {
      name: 'merchant-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        messages: state.messages
      })
    }
  )
)
