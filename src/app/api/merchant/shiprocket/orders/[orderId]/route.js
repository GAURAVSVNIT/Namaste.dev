import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';
import { shiprocketLogger } from '@/lib/logger';

export async function GET(request, { params }) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    shiprocketLogger.info('Fetching specific Shiprocket order', { orderId });

    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();

    // Fetch specific order from Shiprocket
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const shiprocketResponse = await response.json();

    if (!response.ok) {
      shiprocketLogger.error('Failed to fetch specific Shiprocket order', {
        orderId,
        status: response.status,
        response: shiprocketResponse
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch order from Shiprocket', details: shiprocketResponse },
        { status: response.status }
      );
    }

    shiprocketLogger.info('Successfully fetched specific Shiprocket order', { orderId });

    // Transform the response to match our frontend format
    const order = shiprocketResponse.data;
    const transformedOrder = {
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
      statusCode: order.status_code,
      items: order.products?.map(product => ({
        name: product.name,
        sku: product.sku,
        quantity: parseInt(product.units),
        price: parseFloat(product.selling_price),
        total: parseFloat(product.selling_price) * parseInt(product.units),
        hsn: product.hsn,
        discount: parseFloat(product.discount || 0),
        tax: parseFloat(product.tax || 0)
      })) || [],
      shippingAddress: {
        customerName: order.shipping_customer_name,
        lastName: order.shipping_last_name,
        address: order.shipping_address,
        address2: order.shipping_address_2,
        city: order.shipping_city,
        state: order.shipping_state,
        pincode: order.shipping_postcode,
        country: order.shipping_country,
        email: order.shipping_email,
        phone: order.shipping_phone
      },
      billingAddress: {
        customerName: order.billing_customer_name,
        lastName: order.billing_last_name,
        address: order.billing_address,
        address2: order.billing_address_2,
        city: order.billing_city,
        state: order.billing_state,
        pincode: order.billing_postcode,
        country: order.billing_country,
        email: order.billing_email,
        phone: order.billing_phone
      },
      paymentMethod: order.payment_method,
      shippingCharges: parseFloat(order.shipping_charges || 0),
      giftWrapCharges: parseFloat(order.giftwrap_charges || 0),
      transactionCharges: parseFloat(order.transaction_charges || 0),
      totalDiscount: parseFloat(order.total_discount || 0),
      subTotal: parseFloat(order.sub_total || 0),
      total: parseFloat(order.total || order.sub_total || 0),
      weight: parseFloat(order.weight || 0),
      dimensions: {
        length: parseFloat(order.length || 0),
        breadth: parseFloat(order.breadth || 0),
        height: parseFloat(order.height || 0)
      },
      pickupLocation: order.pickup_location,
      courierCompanyId: order.courier_company_id,
      courierName: order.courier_name,
      awbCode: order.awb_code,
      orderDate: order.order_date,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shipmentId: order.shipment_id,
      comment: order.comment,
      // Additional tracking information
      tracking: {
        awbCode: order.awb_code,
        courierName: order.courier_name,
        shipmentStatus: order.shipment_status,
        currentStatus: order.current_status,
        deliveryBoy: order.delivery_boy,
        deliveryBoyPhone: order.delivery_boy_phone,
        estimatedDeliveryDate: order.estimated_delivery_date,
        actualDeliveryDate: order.actual_delivery_date
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder
    });

  } catch (error) {
    shiprocketLogger.error('Error fetching specific Shiprocket order', {
      orderId: params.orderId,
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
