import { NextResponse } from 'next/server';

// Dynamically import Razorpay only when needed to avoid build-time issues
const createRazorpayInstance = async () => {
  const Razorpay = (await import('razorpay')).default;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function POST(request) {
  try {
    // Check for required environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay configuration is missing' },
        { status: 500 }
      );
    }

    // Initialize Razorpay instance with credentials from environment variables
    const razorpay = await createRazorpayInstance();

    const { 
      amount, 
      currency = 'INR', 
      receipt, 
      customerName, 
      customerEmail, 
      customerPhone, 
      items, 
      shippingAddress, 
      billingAddress 
    } = await request.json();

    // Validate required fields
    if (!amount || !receipt) {
      return NextResponse.json(
        { error: 'Amount and receipt are required' },
        { status: 400 }
      );
    }

    // Create Razorpay order with additional details in notes
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
      notes: {
        customer_name: customerName || 'N/A',
        customer_email: customerEmail || 'N/A',
        customer_phone: customerPhone || 'N/A',
        items: items ? JSON.stringify(items) : '[]',
        shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : '{}',
        billing_address: billingAddress ? JSON.stringify(billingAddress) : '{}',
        created_via: 'merchant_dashboard'
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Safe to send key_id to client
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
