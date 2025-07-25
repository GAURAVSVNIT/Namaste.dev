import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const source = searchParams.get('source'); // 'shiprocket', 'razorpay', or 'all'

    console.log('🚀 ORDERS API - Request received:', {
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
          // Add source identifier to each order
          const shiprocketOrders = shiprocketData.data.map(order => ({
            ...order,
            source: 'shiprocket',
            paymentStatus: 'cod' // Assuming Shiprocket orders are mostly COD
          }));
          
          allOrders.push(...shiprocketOrders);
          totalShiprocketOrders = shiprocketData.pagination?.total || 0;
          
          // Log sample orders
          console.log('✅ Shiprocket orders fetched:', {
            count: shiprocketOrders.length,
            total: totalShiprocketOrders,
            sampleOrders: shiprocketOrders.slice(0, 2).map(o => ({
              id: o.orderId,
              customer: o.customerName,
              status: o.status,
              total: o.total,
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
    allOrders.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate));

    console.log('📊 Orders summary:', {
      totalOrders: allOrders.length,
      shiprocketOrders: allOrders.filter(o => o.source === 'shiprocket').length,
      statusBreakdown: {
        paid: allOrders.filter(o => o.status === 'paid').length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        shipped: allOrders.filter(o => o.status === 'shipped').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length
      },
      paymentStatusBreakdown: {
        paid_online: allOrders.filter(o => o.paymentStatus === 'paid_online').length,
        cod: allOrders.filter(o => o.paymentStatus === 'cod').length,
        pending: allOrders.filter(o => o.paymentStatus === 'pending').length
      }
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
        total: totalCount
      }
    };

    console.log('✅ ORDERS API - Final Response:', {
      success: true,
      ordersReturned: paginatedOrders.length,
      pagination: finalResponse.pagination,
      summary: finalResponse.summary,
      orderDetails: paginatedOrders.map(o => ({
        id: o.orderId,
        source: o.source,
        status: o.status,
        paymentStatus: o.paymentStatus,
        total: o.total,
        customer: o.customerName
      }))
    });

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('🚨 ORDERS API - Critical Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
