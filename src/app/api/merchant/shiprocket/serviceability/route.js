import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';
import { shiprocketLogger } from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pickup_postcode = searchParams.get('pickup_postcode');
    const delivery_postcode = searchParams.get('delivery_postcode');
    const order_id = searchParams.get('order_id'); // optional for reassigning courier

    if (!pickup_postcode || !delivery_postcode) {
      return NextResponse.json({
        success: false,
        error: 'pickup_postcode and delivery_postcode are required',
      }, { status: 400 });
    }

    shiprocketLogger.info('Fetching Shiprocket serviceability', { 
      pickup_postcode, 
      delivery_postcode, 
      order_id 
    });

    const token = await getValidShiprocketToken();

    const params = new URLSearchParams({
      pickup_postcode,
      delivery_postcode,
    });
    if (order_id) {
      params.append('order_id', order_id);
    }

    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      shiprocketLogger.error('Failed to fetch serviceability', { 
        status: response.status, 
        data,
        pickup_postcode,
        delivery_postcode 
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch serviceability', 
        details: data 
      }, { status: response.status });
    }

    shiprocketLogger.info('Serviceability fetched successfully', { 
      pickup_postcode, 
      delivery_postcode, 
      order_id,
      courier_count: data?.data?.available_courier_companies?.length || 0
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    shiprocketLogger.error('Error in serviceability API', { 
      error: error.message, 
      stack: error.stack 
    });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { pickup_postcode, delivery_postcode, order_id, weight, cod } = await request.json();

    if (!pickup_postcode || !delivery_postcode) {
      return NextResponse.json({
        success: false,
        error: 'pickup_postcode and delivery_postcode are required',
      }, { status: 400 });
    }

    shiprocketLogger.info('Fetching Shiprocket serviceability via POST', { 
      pickup_postcode, 
      delivery_postcode, 
      order_id,
      weight,
      cod
    });

    const token = await getValidShiprocketToken();

    const requestBody = {
      pickup_postcode,
      delivery_postcode,
    };

    if (order_id) requestBody.order_id = order_id;
    if (weight) requestBody.weight = weight;
    if (cod !== undefined) requestBody.cod = cod;

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/courier/serviceability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      shiprocketLogger.error('Failed to fetch serviceability via POST', { 
        status: response.status, 
        data,
        requestBody
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch serviceability', 
        details: data 
      }, { status: response.status });
    }

    shiprocketLogger.info('Serviceability fetched successfully via POST', { 
      pickup_postcode, 
      delivery_postcode, 
      order_id,
      courier_count: data?.data?.available_courier_companies?.length || 0
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    shiprocketLogger.error('Error in serviceability POST API', { 
      error: error.message, 
      stack: error.stack 
    });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
