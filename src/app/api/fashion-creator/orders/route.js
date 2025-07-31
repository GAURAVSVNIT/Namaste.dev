import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const source = searchParams.get('source'); // 'shiprocket', 'razorpay', or 'all'

    console.log('🚀 FASHION CREATOR ORDERS API - Request received:', {
      page,
      limit,
      status,
      source,
      url: request.url,
      timestamp: new Date().toISOString()
    });

    // Only fetch from Shiprocket now
    const fetchShiprocket = !source || source === 'all' || source === 'shiprocket';

    console.log('📋 Source determination:', {
      fetchShiprocket,
      requestedSource: source
    });

    const allOrders = [];
    let totalShiprocketOrders = 0;

    // Fetch from Shiprocket if needed
    if (fetchShiprocket) {
      console.log('📡 Fetching from Shiprocket API...');
      try {
        const shiprocketUrl = new URL('/api/shiprocket/orders', request.url);
        shiprocketUrl.searchParams.set('page', '1');
        shiprocketUrl.searchParams.set('limit', '50'); // Fetch more to combine properly
        if (status && status !== 'all') {
          shiprocketUrl.searchParams.set('status', status);
        }

        console.log('🔗 Shiprocket URL:', shiprocketUrl.toString());
        const shiprocketResponse = await fetch(shiprocketUrl.toString());
        const shiprocketData = await shiprocketResponse.json();

        console.log('📦 Shiprocket API Response:', {
          success: shiprocketData.success,
          dataLength: shiprocketData.data?.length || 0,
          totalFromPagination: shiprocketData.pagination?.total || 0,
          error: shiprocketData.error || 'none'
        });

        if (shiprocketData.success) {
          // Add source identifier to each order and transform for fashion creator context
          const shiprocketOrders = shiprocketData.data.map(order => ({
            ...order,
            source: 'shiprocket',
            paymentStatus: 'cod', // Assuming Shiprocket orders are mostly COD
            // Transform terminology for fashion creator context
            commissionId: order.orderId,
            orderId: order.orderId, // Keep original for compatibility
            commissionStatus: order.status,
            commissionTotal: order.total,
            creatorCommission: calculateCreatorCommission(order.total), // Calculate commission amount
            clientName: order.customerName, // Fashion creators work with clients
            clientEmail: order.customerEmail,
            clientPhone: order.customerPhone,
            designCategory: extractDesignCategory(order), // Extract design category if available
            consultationDate: order.createdAt || order.orderDate
          }));
          
          allOrders.push(...shiprocketOrders);
          totalShiprocketOrders = shiprocketData.pagination?.total || 0;
          
          // Log sample orders
          console.log('✅ Fashion Creator orders fetched:', {
            count: shiprocketOrders.length,
            total: totalShiprocketOrders,
            sampleOrders: shiprocketOrders.slice(0, 2).map(o => ({
              id: o.commissionId,
              client: o.clientName,
              status: o.commissionStatus,
              total: o.commissionTotal,
              commission: o.creatorCommission,
              paymentStatus: o.paymentStatus
            }))
          });
        } else {
          console.error('❌ Failed to fetch Shiprocket orders:', shiprocketData.error);
        }
      } catch (error) {
        console.error('🚨 Error fetching Shiprocket orders:', {
          message: error.message,
          stack: error.stack
        });
      }
    }

    // Sort all orders by creation date (newest first)
    console.log('🔄 Sorting orders...');
    allOrders.sort((a, b) => new Date(b.createdAt || b.orderDate || b.consultationDate) - new Date(a.createdAt || a.orderDate || a.consultationDate));

    console.log('📊 Fashion Creator Orders summary:', {
      totalOrders: allOrders.length,
      shiprocketOrders: allOrders.filter(o => o.source === 'shiprocket').length,
      statusBreakdown: {
        paid: allOrders.filter(o => o.commissionStatus === 'paid').length,
        pending: allOrders.filter(o => o.commissionStatus === 'pending').length,
        processing: allOrders.filter(o => o.commissionStatus === 'processing').length,
        shipped: allOrders.filter(o => o.commissionStatus === 'shipped').length,
        delivered: allOrders.filter(o => o.commissionStatus === 'delivered').length
      },
      paymentStatusBreakdown: {
        paid_online: allOrders.filter(o => o.paymentStatus === 'paid_online').length,
        cod: allOrders.filter(o => o.paymentStatus === 'cod').length,
        pending: allOrders.filter(o => o.paymentStatus === 'pending').length
      },
      totalCommissions: allOrders.reduce((sum, o) => sum + (o.creatorCommission || 0), 0)
    });

    // Apply pagination to combined results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = allOrders.slice(startIndex, endIndex);

    // Calculate total count
    const totalCount = totalShiprocketOrders;
    const totalPages = Math.ceil(totalCount / limit);

    console.log('📄 Pagination applied:', {
      totalCombined: allOrders.length,
      startIndex,
      endIndex,
      paginatedCount: paginatedOrders.length,
      totalFromAPIs: totalCount,
      totalPages
    });

    const finalResponse = {
      success: true,
      data: paginatedOrders,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasMore: page < totalPages
      },
      summary: {
        shiprocket: totalShiprocketOrders,
        total: totalCount,
        totalCommissions: allOrders.reduce((sum, o) => sum + (o.creatorCommission || 0), 0)
      }
    };

    console.log('✅ FASHION CREATOR ORDERS API - Final Response:', {
      success: true,
      ordersReturned: paginatedOrders.length,
      pagination: finalResponse.pagination,
      summary: finalResponse.summary,
      orderDetails: paginatedOrders.map(o => ({
        id: o.commissionId,
        source: o.source,
        status: o.commissionStatus,
        paymentStatus: o.paymentStatus,
        total: o.commissionTotal,
        commission: o.creatorCommission,
        client: o.clientName
      }))
    });

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('🚨 FASHION CREATOR ORDERS API - Critical Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fashion creator orders',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate creator commission (e.g., 15% of total)
function calculateCreatorCommission(total) {
  const commissionRate = 0.15; // 15% commission
  return Math.round(total * commissionRate * 100) / 100; // Round to 2 decimal places
}

// Helper function to extract design category from order data
function extractDesignCategory(order) {
  // This would typically extract from product names, descriptions, or custom fields
  // For now, return a default category
  if (order.productName) {
    if (order.productName.toLowerCase().includes('dress')) return 'Dresses';
    if (order.productName.toLowerCase().includes('suit')) return 'Suits';
    if (order.productName.toLowerCase().includes('casual')) return 'Casual Wear';
    if (order.productName.toLowerCase().includes('formal')) return 'Formal Wear';
  }
  return 'Custom Design';
}
