import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from './firebase';

// Order Management Functions
export async function createOrder(orderData) {
  const order = {
    ...orderData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'orders'), order);
  return docRef.id;
}

export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrderById(orderId) {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    return { id: orderSnap.id, ...orderSnap.data() };
  }
  return null;
}

// Product Management Functions
export async function addProduct(productData) {
  const product = {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'products'), product);
  return docRef.id;
}

export async function updateProduct(productId, updates) {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId) {
  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);
}

export async function getProductsByMerchant(merchantId) {
  const q = query(
    collection(db, 'products'),
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
}

// Stats and Analytics Functions
export async function updateDailyStats(date, updates) {
  const statsId = `daily_${date.toISOString().split('T')[0]}`;
  const statsRef = doc(db, 'stats', statsId);
  
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    // Update existing stats
    const currentStats = statsSnap.data();
    await updateDoc(statsRef, {
      revenue: (currentStats.revenue || 0) + (updates.revenue || 0),
      orders: (currentStats.orders || 0) + (updates.orders || 0),
      products_sold: (currentStats.products_sold || 0) + (updates.products_sold || 0),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new stats document
    await setDoc(statsRef, {
      date: Timestamp.fromDate(date),
      revenue: updates.revenue || 0,
      orders: updates.orders || 0,
      products_sold: updates.products_sold || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getStatsForPeriod(startDate, endDate) {
  const statsQuery = query(
    collection(db, 'stats'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(statsQuery);
  const stats = [];
  snapshot.forEach(doc => {
    stats.push({ id: doc.id, ...doc.data() });
  });
  
  return stats;
}

// Real-time Revenue Tracking
export function subscribeToRevenueUpdates(merchantId, callback) {
  const revenueQuery = query(
    collection(db, 'transactions'),
    where('merchantId', '==', merchantId),
    where('status', '==', 'completed'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  
  return onSnapshot(revenueQuery, snapshot => {
    let totalRevenue = 0;
    const transactions = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.amount || 0;
      transactions.push({ id: doc.id, ...data });
    });
    
    callback({ totalRevenue, transactions });
  });
}

// Product Analytics
export async function getTopSellingProducts(limit = 10) {
  const productsQuery = query(
    collection(db, 'products'),
    orderBy('sold_count', 'desc'),
    limit(limit)
  );
  
  const snapshot = await getDocs(productsQuery);
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  
  return products;
}

export async function updateProductSoldCount(productId, quantity) {
  const productRef = doc(db, 'products', productId);
  const productSnap = await getDoc(productRef);
  
  if (productSnap.exists()) {
    const currentCount = productSnap.data().sold_count || 0;
    await updateDoc(productRef, {
      sold_count: currentCount + quantity,
      stock: productSnap.data().stock - quantity,
      updatedAt: serverTimestamp(),
    });
  }
}

// Chat/Message Functions
export async function createMerchantChat(merchantId, customerId, initialMessage) {
  const chat = {
    merchantId,
    customerId,
    messages: [{
      content: initialMessage,
      senderId: customerId,
      timestamp: serverTimestamp(),
      read: false
    }],
    lastMessage: initialMessage,
    unreadCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'merchant_chats'), chat);
  return docRef.id;
}

export function subscribeToMerchantChats(merchantId, callback) {
  const chatsQuery = query(
    collection(db, 'merchant_chats'),
    where('merchantId', '==', merchantId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(chatsQuery, snapshot => {
    const chats = [];
    snapshot.forEach(doc => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    callback(chats);
  });
}

export async function sendChatMessage(chatId, senderId, message) {
  const chatRef = doc(db, 'merchant_chats', chatId);
  const chatSnap = await getDoc(chatRef);
  
  if (chatSnap.exists()) {
    const chatData = chatSnap.data();
    const newMessage = {
      content: message,
      senderId,
      timestamp: serverTimestamp(),
      read: false
    };
    
    await updateDoc(chatRef, {
      messages: [...chatData.messages, newMessage],
      lastMessage: message,
      unreadCount: chatData.unreadCount + 1,
      updatedAt: serverTimestamp(),
    });
  }
}

// Payment/Transaction Functions
export async function createTransaction(transactionData) {
  const transaction = {
    ...transactionData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'transactions'), transaction);
  return docRef.id;
}

export async function updateTransactionStatus(transactionId, status) {
  const transactionRef = doc(db, 'transactions', transactionId);
  await updateDoc(transactionRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTransactions(merchantId, callback) {
  const transactionsQuery = query(
    collection(db, 'transactions'),
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(transactionsQuery, snapshot => {
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    callback(transactions);
  });
}

// Dashboard Summary Functions
export async function getMerchantDashboardSummary(merchantId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get today's stats
  const todayStatsId = `merchant_${merchantId}_daily_${today.toISOString().split('T')[0]}`;
  const todayStatsRef = doc(db, 'merchant_stats', todayStatsId);
  const todayStatsSnap = await getDoc(todayStatsRef);
  
  const todayStats = todayStatsSnap.exists() ? todayStatsSnap.data() : {
    revenue: 0,
    orders: 0,
    products_sold: 0
  };
  
  // Get active orders count
  const activeOrdersQuery = query(
    collection(db, 'orders'),
    where('merchantId', '==', merchantId),
    where('status', 'in', ['pending', 'processing', 'shipped'])
  );
  const activeOrdersSnap = await getDocs(activeOrdersQuery);
  const activeOrdersCount = activeOrdersSnap.size;
  
  // Get total products count
  const productsQuery = query(
    collection(db, 'products'),
    where('merchantId', '==', merchantId)
  );
  const productsSnap = await getDocs(productsQuery);
  const totalProductsCount = productsSnap.size;
  
  // Get unread messages count
  const unreadChatsQuery = query(
    collection(db, 'merchant_chats'),
    where('merchantId', '==', merchantId),
    where('unreadCount', '>', 0)
  );
  const unreadChatsSnap = await getDocs(unreadChatsQuery);
  let unreadMessagesCount = 0;
  unreadChatsSnap.forEach(doc => {
    unreadMessagesCount += doc.data().unreadCount;
  });
  
  return {
    todayRevenue: todayStats.revenue,
    todayOrders: todayStats.orders,
    activeOrders: activeOrdersCount,
    totalProducts: totalProductsCount,
    unreadMessages: unreadMessagesCount,
    todayProductsSold: todayStats.products_sold
  };
}

// Real-time Dashboard Updates
export function subscribeToDashboardUpdates(merchantId, callback) {
  const unsubscribers = [];
  
  // Subscribe to orders
  const ordersQuery = query(
    collection(db, 'orders'),
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  unsubscribers.push(
    onSnapshot(ordersQuery, snapshot => {
      const recentOrders = [];
      snapshot.forEach(doc => {
        recentOrders.push({ id: doc.id, ...doc.data() });
      });
      callback({ recentOrders });
    })
  );
  
  // Subscribe to stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStatsId = `merchant_${merchantId}_daily_${today.toISOString().split('T')[0]}`;
  const todayStatsRef = doc(db, 'merchant_stats', todayStatsId);
  
  unsubscribers.push(
    onSnapshot(todayStatsRef, doc => {
      if (doc.exists()) {
        callback({ todayStats: doc.data() });
      }
    })
  );
  
  // Return unsubscribe function
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
}
