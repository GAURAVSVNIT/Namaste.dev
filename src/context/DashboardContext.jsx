'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} image
 * @property {string[]} sizes
 * @property {string[]} categories
 * @property {string} description
 * @property {number} inventory
 * @property {'active'|'inactive'} status
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} customer
 * @property {{ product: Product, quantity: number }[]} products
 * @property {'pending'|'processing'|'shipped'|'delivered'|'cancelled'} status
 * @property {number} total
 * @property {string} date
 * @property {string} [tracking]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {string} sender
 * @property {string} message
 * @property {string} timestamp
 * @property {boolean} [isSupport]
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {'sale'|'withdrawal'|'refund'} type
 * @property {number} amount
 * @property {'completed'|'pending'|'failed'} status
 * @property {string} date
 * @property {string} description
 */

/**
 * @typedef {Object} DashboardState
 * @property {Product[]} products
 * @property {Order[]} orders
 * @property {ChatMessage[]} messages
 * @property {Transaction[]} transactions
 * @property {{ totalOrders: number, totalRevenue: number, totalProducts: number, inventoryLeft: number, conversionRate: number }} stats
 */

/**
 * @typedef {Object} DashboardAction
 * @property {string} type
 * @property {*} payload
 */

const initialState = {
  products: [
    {
      id: '1',
      name: 'Classic Cotton T-Shirt',
      price: 29.99,
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
      sizes: ['S', 'M', 'L', 'XL'],
      categories: ['T-Shirts', 'Casual'],
      description: 'Premium cotton t-shirt with perfect fit',
      inventory: 50,
      status: 'active'
    },
    {
      id: '2',
      name: 'Denim Jacket',
      price: 89.99,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      sizes: ['M', 'L', 'XL'],
      categories: ['Jackets', 'Denim'],
      description: 'Classic denim jacket for all seasons',
      inventory: 25,
      status: 'active'
    }
  ],
  orders: [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      products: [
        { product: { id: '1', name: 'Classic Cotton T-Shirt' }, quantity: 2 }
      ],
      status: 'pending',
      total: 59.98,
      date: '2024-01-15',
      tracking: 'TRK12345'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      products: [
        { product: { id: '2', name: 'Denim Jacket' }, quantity: 1 }
      ],
      status: 'shipped',
      total: 89.99,
      date: '2024-01-14',
      tracking: 'TRK12346'
    }
  ],
  messages: [
    {
      id: '1',
      sender: 'Support',
      message: 'Hello! How can I help you today?',
      timestamp: '2024-01-15T10:30:00Z',
      isSupport: true
    }
  ],
  transactions: [
    {
      id: 'TXN-001',
      type: 'sale',
      amount: 59.98,
      status: 'completed',
      date: '2024-01-15',
      description: 'Order #ORD-001'
    },
    {
      id: 'TXN-002',
      type: 'withdrawal',
      amount: 500.00,
      status: 'pending',
      date: '2024-01-14',
      description: 'Withdrawal request'
    }
  ],
  stats: {
    totalOrders: 145,
    totalRevenue: 12450.00,
    totalProducts: 48,
    inventoryLeft: 1250,
    conversionRate: 3.4
  }
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o => 
          o.id === action.payload.id ? { ...o, status: action.payload.status } : o
        )
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    default:
      return state;
  }
};

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};