import { getValidShiprocketToken } from '@/lib/shiprocket';
import { NextResponse } from 'next/server';
import { shiprocketLogger } from '@/lib/logger';

export async function POST(request) {
  try {
    shiprocketLogger.info('Starting product creation in Shiprocket');
    
    // 1. Get a valid token. The function handles caching automatically.
    const token = await getValidShiprocketToken();
    shiprocketLogger.info('Token obtained successfully');

    // 2. Extract product data from the request body
    const productData = await request.json();
    shiprocketLogger.info('Product data received', { productData });

    // 3. Set up the request to Shiprocket API
    const shiprocketResponse = await fetch('https://apiv2.shiprocket.in/v1/external/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    shiprocketLogger.info('Shiprocket API response received', {
      status: shiprocketResponse.status,
      statusText: shiprocketResponse.statusText,
      headers: Object.fromEntries(shiprocketResponse.headers.entries())
    });
    
    let responseData;
    try {
      const responseText = await shiprocketResponse.text();
      shiprocketLogger.info('Raw response text', { responseText });
      
      if (!responseText) {
        shiprocketLogger.error('Empty response from Shiprocket');
        throw new Error('Empty response from Shiprocket');
      }
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      shiprocketLogger.error('Failed to parse Shiprocket response', {
        error: parseError.message,
        status: shiprocketResponse.status,
        statusText: shiprocketResponse.statusText
      });
      throw new Error('Invalid response from Shiprocket API');
    }

    if (!shiprocketResponse.ok) {
      shiprocketLogger.error('Shiprocket product creation failed', {
        status: shiprocketResponse.status,
        responseData
      });
      throw new Error(responseData.message || 'Unknown error');
    }

    shiprocketLogger.info('Product created successfully in Shiprocket', { responseData });
    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    shiprocketLogger.error('Error creating product in Shiprocket', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create product in Shiprocket',
      error: error.message 
    }, { status: 500 });
  }
}
