import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';

export async function GET(request) {
  try {
    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();

    // Fetch products from Shiprocket
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data || []
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
