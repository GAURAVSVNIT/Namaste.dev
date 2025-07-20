import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';
import { shiprocketLogger } from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 10;
    const status = searchParams.get('status');

    shiprocketLogger.info('Fetching Shiprocket orders', { 
      page, 
      limit, 
      status,
      requestUrl: request.url 
    });

    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();
    shiprocketLogger.info('Retrieved Shiprocket token successfully');

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status && status !== 'all') {
      queryParams.append('status', status);
    }

    // Fetch orders from Shiprocket
    const shiprocketUrl = `https://apiv2.shiprocket.in/v1/external/orders?${queryParams}`;
    shiprocketLogger.info('Making Shiprocket API request', {
      url: shiprocketUrl,
      params: Object.fromEntries(queryParams)
    });
    
    const response = await fetch(shiprocketUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const shiprocketResponse = await response.json();
    
    shiprocketLogger.info('Shiprocket API response received', {
      status: response.status,
      ok: response.ok,
      hasData: !!shiprocketResponse.data,
      dataLength: shiprocketResponse.data?.length || 0,
      pagination: shiprocketResponse.meta?.pagination
    });

    if (!response.ok) {
      shiprocketLogger.error('Failed to fetch Shiprocket orders', {
        status: response.status,
        statusText: response.statusText,
        url: shiprocketUrl,
        response: shiprocketResponse,
        params: Object.fromEntries(queryParams)
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders from Shiprocket', details: shiprocketResponse },
        { status: 500 }
      );
    }

    shiprocketLogger.info('Successfully fetched Shiprocket orders', {
      totalOrders: shiprocketResponse.data?.length || 0,
      page,
      limit,
      totalFromAPI: shiprocketResponse.meta?.pagination?.total || 0,
      currentPage: shiprocketResponse.meta?.pagination?.current_page || 1,
      totalPages: shiprocketResponse.meta?.pagination?.total_pages || 1
    });

    // Transform the response to match our frontend format
    shiprocketLogger.info('Transforming Shiprocket orders data', {
      ordersToTransform: shiprocketResponse.data?.length || 0
    });
    
    const transformedOrders = shiprocketResponse.data?.map(order => ({
      id: order.id,
      orderId: order.order_id,
      channelOrderId: order.channel_order_id,
      customerName: `${order.customer_name} ${order.customer_last_name || ''}`.trim(),
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      status: order.status_code === 1 ? 'new' : 
              order.status_code === 6 ? 'shipped' :
              order.status_code === 7 ? 'delivered' :
              order.status_code === 9 ? 'cancelled' : 'processing',
      items: order.products?.map(product => ({
        name: product.name,
        sku: product.sku,
        quantity: parseInt(product.units),
        price: parseFloat(product.selling_price),
        total: parseFloat(product.selling_price) * parseInt(product.units)
      })) || [],
      shippingAddress: {
        address: order.shipping_address,
        city: order.shipping_city,
        state: order.shipping_state,
        pincode: order.shipping_postcode,
        country: order.shipping_country
      },
      billingAddress: {
        address: order.billing_address,
        city: order.billing_city,
        state: order.billing_state,
        pincode: order.billing_postcode,
        country: order.billing_country
      },
      paymentMethod: order.payment_method,
      subTotal: parseFloat(order.sub_total || 0),
      total: parseFloat(order.total || order.sub_total || 0),
      weight: parseFloat(order.weight || 0),
      dimensions: {
        length: parseFloat(order.length || 0),
        breadth: parseFloat(order.breadth || 0),
        height: parseFloat(order.height || 0)
      },
      courierName: order.courier_name,
      awbCode: order.awb_code,
      orderDate: order.order_date,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shipmentId: order.shipment_id,
      // Additional debug information
      statusCode: order.status_code,
      rawStatus: order.status
    })) || [];
    
    // Log transformation results
    shiprocketLogger.info('Orders transformation complete', {
      originalCount: shiprocketResponse.data?.length || 0,
      transformedCount: transformedOrders.length,
      statusCodes: transformedOrders.map(o => ({ id: o.orderId, status: o.status, statusCode: o.statusCode }))
    });
    
    const finalResponse = {

      success: true,
      data: transformedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: shiprocketResponse.meta?.pagination?.total || transformedOrders.length,
        totalPages: shiprocketResponse.meta?.pagination?.total_pages || 1,
        currentPage: shiprocketResponse.meta?.pagination?.current_page || 1,
        hasMore: transformedOrders.length === parseInt(limit)
      }
    };
    
    shiprocketLogger.info('Orders API response prepared', {
      success: finalResponse.success,
      dataCount: finalResponse.data.length,
      pagination: finalResponse.pagination
    });
    
    return NextResponse.json(finalResponse);

  } catch (error) {
    shiprocketLogger.error('Error fetching Shiprocket orders', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
