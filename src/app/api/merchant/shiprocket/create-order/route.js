import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';
import { shiprocketLogger } from '@/lib/logger';

export async function POST(request) {
  try {
    const {
      orderId,
      orderDate,
      billingAddress,
      shippingAddress,
      orderItems,
      paymentMethod,
      subTotal
    } = await request.json();

    shiprocketLogger.info('Creating Shiprocket order', { orderId });

    // Validate required fields
    if (!orderId || !orderItems || !billingAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required order data' },
        { status: 400 }
      );
    }

    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();

    // Format order data for Shiprocket API (adhoc endpoint)
    const shiprocketOrderData = {
      order_id: orderId,
      order_date: orderDate || new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id: "", // Empty for adhoc endpoint
      comment: "Order from Namaste.dev Marketplace",
      
      // Billing details
      billing_customer_name: billingAddress.firstName,
      billing_last_name: billingAddress.lastName || "",
      billing_address: billingAddress.address,
      billing_address_2: "",
      billing_city: billingAddress.city,
      billing_pincode: billingAddress.zipCode,
      billing_state: billingAddress.state,
      billing_country: billingAddress.country || "India",
      billing_email: billingAddress.email,
      billing_phone: billingAddress.phone,
      
      // Shipping details (use billing if shipping_is_billing is true)
      shipping_is_billing: shippingAddress ? 0 : 1,
      shipping_customer_name: shippingAddress?.firstName || "",
      shipping_last_name: shippingAddress?.lastName || "",
      shipping_address: shippingAddress?.address || "",
      shipping_address_2: "",
      shipping_city: shippingAddress?.city || "",
      shipping_pincode: shippingAddress?.zipCode || "",
      shipping_state: shippingAddress?.state || "",
      shipping_country: shippingAddress?.country || "",
      shipping_email: shippingAddress?.email || "",
      shipping_phone: shippingAddress?.phone || "",
      
      // Order items
      order_items: orderItems.map(item => ({
        name: item.name,
        sku: item.sku || item.id,
        units: item.quantity.toString(),
        selling_price: item.price.toString(),
        discount: "0",
        tax: "0",
        hsn: ""
      })),
      
      // Payment and totals
      payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: "",
      giftwrap_charges: "",
      transaction_charges: "",
      total_discount: "",
      sub_total: subTotal.toString(),
      
      // Package dimensions (you can make these dynamic based on items)
      length: "10",
      breadth: "10", 
      height: "10",
      weight: "0.5"
    };

    shiprocketLogger.info('Shiprocket order data', {
      orderId,
      channel_id: shiprocketOrderData.channel_id,
      pickup_location: shiprocketOrderData.pickup_location,
      payment_method: shiprocketOrderData.payment_method
    });

    // Create order in Shiprocket using adhoc endpoint (doesn't require channel_id)
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketOrderData)
    });

    const shiprocketResponse = await response.json();

    if (!response.ok) {
      shiprocketLogger.error('Shiprocket order creation failed', {
        orderId,
        status: response.status,
        response: shiprocketResponse
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to create shipping order', details: shiprocketResponse },
        { status: 500 }
      );
    }

    shiprocketLogger.info('Shiprocket order created successfully', {
      orderId,
      shipment_id: shiprocketResponse.shipment_id,
      status: shiprocketResponse.status
    });

    return NextResponse.json({
      success: true,
      data: {
        shiprocket_order_id: shiprocketResponse.order_id,
        shipment_id: shiprocketResponse.shipment_id,
        status: shiprocketResponse.status,
        awb_code: shiprocketResponse.awb_code,
        courier_name: shiprocketResponse.courier_name
      }
    });

  } catch (error) {
    shiprocketLogger.error('Error creating Shiprocket order', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to create shipping order' },
      { status: 500 }
    );
  }
}
