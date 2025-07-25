import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    console.log('🚀 Razorpay Payments API - Request received:', {
      page,
      limit,
      status,
      url: request.url,
      timestamp: new Date().toISOString()
    });

    // Check for required environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.log('❌ Razorpay configuration missing');
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration is missing' },
        { status: 500 }
      );
    }

    // Create Razorpay auth header
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build query parameters for Razorpay API
    const razorpayParams = new URLSearchParams({
      count: limit.toString(),
      skip: skip.toString()
    });

    // Fetch from Razorpay orders API
    const razorpayUrl = `https://api.razorpay.com/v1/orders?${razorpayParams}`;
    console.log('📡 Fetching from Razorpay:', razorpayUrl);

    const razorpayResponse = await fetch(razorpayUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('❌ Razorpay API Error:', {
        status: razorpayResponse.status,
        statusText: razorpayResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Razorpay API error: ${razorpayResponse.status}`,
          details: errorText
        },
        { status: razorpayResponse.status }
      );
    }

    const razorpayData = await razorpayResponse.json();
    
    console.log('📦 Raw Razorpay API Response:', {
      itemsCount: razorpayData.items?.length || 0,
      totalCount: razorpayData.count || 0,
      hasItems: !!razorpayData.items,
      entity: razorpayData.entity
    });

    // Transform Razorpay orders to payment transactions format
    const transformedPayments = razorpayData.items.map((order, index) => {
      // Determine payment status based on Razorpay order status
      let paymentStatus = 'pending';
      if (order.status === 'paid') {
        paymentStatus = 'completed';
      } else if (order.status === 'created') {
        paymentStatus = 'pending';
      } else if (order.status === 'attempted') {
        paymentStatus = 'failed';
      }

      // Determine transaction type (assuming all are sales for now)
      const transactionType = 'sale';

      const transformedPayment = {
        id: order.id,
        orderId: order.id,
        type: transactionType,
        status: paymentStatus,
        amount: order.amount / 100, // Convert from paise to rupees
        currency: order.currency || 'INR',
        description: `Payment for Order ${order.receipt || order.id}`,
        date: new Date(order.created_at * 1000).toISOString(), // Convert Unix timestamp
        createdAt: new Date(order.created_at * 1000).toISOString(),
        paymentMethod: 'Razorpay',
        reference: order.receipt || order.id,
        
        // Additional Razorpay specific fields
        razorpayOrderId: order.id,
        amountPaid: order.amount_paid / 100,
        amountDue: order.amount_due / 100,
        attempts: order.attempts,
        notes: order.notes || {},
        offerId: order.offer_id,
        
        // Source identifier
        source: 'razorpay'
      };

      if (index < 3) { // Log first 3 payments for debugging
        console.log(`📋 Transformed payment ${index + 1}:`, {
          id: transformedPayment.id,
          status: transformedPayment.status,
          amount: transformedPayment.amount,
          date: transformedPayment.date,
          type: transformedPayment.type
        });
      }

      return transformedPayment;
    });

    // Apply status filter if provided
    let filteredPayments = transformedPayments;
    if (status && status !== 'all') {
      filteredPayments = transformedPayments.filter(payment => {
        switch (status) {
          case 'completed':
            return payment.status === 'completed';
          case 'pending':
            return payment.status === 'pending';
          case 'failed':
            return payment.status === 'failed';
          default:
            return true;
        }
      });
    }

    // Calculate pagination
    const totalCount = razorpayData.count || filteredPayments.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Calculate summary statistics
    const summary = {
      totalPayments: totalCount,
      totalAmount: transformedPayments.reduce((sum, payment) => sum + payment.amount, 0),
      completedPayments: transformedPayments.filter(p => p.status === 'completed').length,
      pendingPayments: transformedPayments.filter(p => p.status === 'pending').length,
      failedPayments: transformedPayments.filter(p => p.status === 'failed').length,
      completedAmount: transformedPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0)
    };

    const finalResponse = {
      success: true,
      data: filteredPayments,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasMore: page < totalPages
      },
      summary: summary
    };

    console.log('✅ Razorpay Payments API - Final Response:', {
      success: true,
      paymentsReturned: filteredPayments.length,
      pagination: finalResponse.pagination,
      summary: finalResponse.summary
    });

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('🚨 Razorpay Payments API - Critical Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payments from Razorpay',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
