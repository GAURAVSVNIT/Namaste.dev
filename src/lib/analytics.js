import { filterRealProducts } from './shiprocket-utils';

/**
 * Parse Shiprocket date format: "28 Jul 2025, 01:16 PM"
 */
function parseDateString(dateString) {
  try {
    // Handle format like "28 Jul 2025, 01:16 PM"
    const [datePart, timePart] = dateString.split(', ');
    if (!datePart || !timePart) return null;
    
    // Convert to a format that Date constructor can handle
    const standardFormat = `${datePart} ${timePart}`;
    const parsed = new Date(standardFormat);
    
    // Check if the date is valid
    if (isNaN(parsed.getTime())) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing date string:', dateString, error);
    return null;
  }
}

/**
 * Fetches real merchant dashboard data
 */
export async function getMerchantDashboardSummary() {
  try {
    // Fetch products data
    const [productsResponse, ordersResponse] = await Promise.allSettled([
      fetch('/api/merchant/shiprocket/products'),
      fetch('/api/merchant/orders')
    ]);

    const productsData = productsResponse.status === 'fulfilled' 
      ? await productsResponse.value.json() 
      : { success: false, data: [] };
      
    const ordersData = ordersResponse.status === 'fulfilled' 
      ? await ordersResponse.value.json() 
      : { success: false, data: [] };

    // Filter real products
    const realProducts = productsData.success 
      ? filterRealProducts(productsData.data || [], false) // Only active products
      : [];

    const orders = ordersData.success ? ordersData.data || [] : [];

    // Calculate today's stats
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Debug logging
    console.log('=== ANALYTICS DEBUG INFO ===');
    console.log('Orders API Response:', ordersData);
    console.log('Orders data:', orders);
    console.log('Orders count:', orders.length);
    if (orders.length > 0) {
      console.log('First order sample:', orders[0]);
      console.log('Order total field:', orders[0].total);
      console.log('Order createdAt field:', orders[0].createdAt);
      console.log('Order orderDate field:', orders[0].orderDate);
    }
    console.log('Today start date:', todayStart);
    console.log('==============================');
    
    const todayOrders = orders.filter(order => {
      if (!order.createdAt && !order.orderDate) return false;
      
      let orderDate;
      const dateString = order.createdAt || order.orderDate;
      
      // Handle Shiprocket date format: "28 Jul 2025, 01:16 PM"
      if (typeof dateString === 'string') {
        // Try to parse the Shiprocket format
        const shiprocketDate = parseDateString(dateString);
        if (shiprocketDate) {
          orderDate = shiprocketDate;
        } else {
          // Fallback to regular Date parsing
          orderDate = new Date(dateString);
        }
      } else {
        orderDate = new Date(dateString);
      }
      
      console.log('Order date parsing:', {
        original: dateString,
        parsed: orderDate,
        todayStart,
        isToday: orderDate >= todayStart
      });
      
      return orderDate >= todayStart;
    });

    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => {
      const amount = parseFloat(order.total || order.amount || 0);
      return sum + amount;
    }, 0);

    // Calculate total revenue (all-time)
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = parseFloat(order.total || order.amount || 0);
      return sum + amount;
    }, 0);

    // Count active orders (non-completed orders)
    const activeOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return !['delivered', 'cancelled', 'completed'].includes(status);
    }).length;

    console.log('Revenue calculations:', {
      todayRevenue,
      totalRevenue,
      todayOrdersCount: todayOrders.length,
      totalOrdersCount: orders.length,
      activeOrders
    });

    // Calculate total inventory value
    const totalInventoryValue = realProducts.reduce((sum, product) => {
      const price = parseFloat(product.mrp || 0);
      const quantity = parseInt(product.quantity || 0);
      return sum + (price * quantity);
    }, 0);

    return {
      todayRevenue,
      totalRevenue, // Add total revenue for all-time stats
      activeOrders,
      totalOrders: orders.length, // Add total orders count
      totalProducts: realProducts.length,
      totalInventoryValue,
      unreadMessages: Math.floor(Math.random() * 10), // Mock for now
      recentOrders: orders.slice(0, 5) // Last 5 orders
    };

  } catch (error) {
    console.error('Error fetching merchant dashboard summary:', error);
    throw error;
  }
}

/**
 * Fetches real analytics data for charts and reports
 */
export async function getAnalyticsData(timeRange = 'monthly') {
  try {
    const [ordersResponse, productsResponse] = await Promise.allSettled([
      fetch('/api/merchant/orders'),
      fetch('/api/merchant/shiprocket/products')
    ]);

    const ordersData = ordersResponse.status === 'fulfilled' 
      ? await ordersResponse.value.json() 
      : { success: false, data: [] };
      
    const productsData = productsResponse.status === 'fulfilled' 
      ? await productsResponse.value.json() 
      : { success: false, data: [] };

    const orders = ordersData.success ? ordersData.data || [] : [];
    const products = productsData.success 
      ? filterRealProducts(productsData.data || [], false) 
      : [];

    // Generate time-based sales data
    const salesData = generateTimeBasedData(orders, timeRange);
    
    // Generate category distribution from products
    const categoryData = generateCategoryData(products);
    
    // Get top performing products
    const topProducts = getTopPerformingProducts(products, orders);

    // Calculate summary statistics
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Mock conversion rate calculation (you'd need visitor data for real calculation)
    const estimatedVisitors = totalOrders * 10; // Assume 10% conversion rate
    const conversionRate = totalOrders > 0 ? (totalOrders / estimatedVisitors) * 100 : 0;

    return {
      salesData,
      categoryData,
      topProducts,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        conversionRate
      }
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

/**
 * Generate time-based sales data for charts
 */
function generateTimeBasedData(orders, timeRange) {
  const now = new Date();
  let labels = [];
  let periods = [];

  switch (timeRange) {
    case 'daily':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        periods.push({
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        });
      }
      break;
      
    case 'weekly':
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        labels.push(`Week ${Math.ceil(date.getDate() / 7)}`);
        periods.push({
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
        });
      }
      break;
      
    case 'yearly':
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        periods.push({
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 1)
        });
      }
      break;
      
    default: // monthly
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.getDate().toString());
        periods.push({
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        });
      }
      break;
  }

  // Calculate sales for each period
  const data = periods.map((period, index) => {
    const periodOrders = orders.filter(order => {
      if (!order.createdAt && !order.orderDate) return false;
      
      let orderDate;
      const dateString = order.createdAt || order.orderDate;
      
      // Handle Shiprocket date format
      if (typeof dateString === 'string') {
        const shiprocketDate = parseDateString(dateString);
        if (shiprocketDate) {
          orderDate = shiprocketDate;
        } else {
          orderDate = new Date(dateString);
        }
      } else {
        orderDate = new Date(dateString);
      }
      
      return orderDate >= period.start && orderDate < period.end;
    });

    const sales = periodOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const orderCount = periodOrders.length;
    const visitors = orderCount * 10; // Mock visitor data

    return {
      name: labels[index],
      sales: Math.round(sales),
      orders: orderCount,
      visitors
    };
  });

  return data;
}

/**
 * Generate category distribution data from products
 */
function generateCategoryData(products) {
  const categoryCount = {};
  const categoryColors = [
    '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', 
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ];

  // Count products by category
  products.forEach(product => {
    const category = product.category_name || 'Uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  // Convert to chart format
  const categories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a) // Sort by count descending
    .slice(0, 5) // Top 5 categories
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / products.length) * 100), // Percentage
      color: categoryColors[index % categoryColors.length]
    }));

  return categories;
}

/**
 * Get top performing products based on stock and recent activity
 */
function getTopPerformingProducts(products, orders) {
  // For now, sort by stock level as a proxy for popularity
  // In a real scenario, you'd track sales data per product
  const topProducts = products
    .sort((a, b) => {
      const stockA = parseInt(a.quantity || 0);
      const stockB = parseInt(b.quantity || 0);
      const priceA = parseFloat(a.mrp || 0);
      const priceB = parseFloat(b.mrp || 0);
      
      // Sort by revenue potential (price * stock)
      return (priceB * stockB) - (priceA * stockA);
    })
    .slice(0, 5)
    .map(product => {
      const stock = parseInt(product.quantity || 0);
      const price = parseFloat(product.mrp || 0);
      
      return {
        id: product.id,
        name: product.name,
        sales: Math.floor(Math.random() * 100) + 20, // Mock sales data
        revenue: Math.floor(Math.random() * 5000) + 1000, // Mock revenue
        category: product.category_name || 'Uncategorized',
        stock: stock,
        status: stock > 10 ? 'in_stock' : stock > 0 ? 'low_stock' : 'out_of_stock'
      };
    });

  return topProducts;
}

/**
 * Fetch real-time dashboard updates
 */
export function subscribeToAnalyticsUpdates(callback) {
  const updateInterval = setInterval(async () => {
    try {
      const summary = await getMerchantDashboardSummary();
      // Pass summary data with proper structure for analytics dashboard
      callback({ 
        ...summary, // Include all summary data including recentOrders
        summary: {
          totalSales: summary.totalRevenue || 0, // Use total revenue instead of today's
          totalOrders: summary.totalOrders || 0, // Use total orders instead of active
          averageOrderValue: summary.totalRevenue && summary.totalOrders ? summary.totalRevenue / summary.totalOrders : 0,
          conversionRate: 10 // Mock conversion rate
        }
      });
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }, 60000); // Update every minute

  return () => clearInterval(updateInterval);
}
