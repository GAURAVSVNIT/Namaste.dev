import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';
import { shiprocketLogger } from '@/lib/logger';

// GET - Fetch all pickup locations
export async function GET(request) {
  try {
    shiprocketLogger.info('Fetching Shiprocket pickup locations');

    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();

    // Fetch pickup locations from Shiprocket
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const shiprocketResponse = await response.json();

    if (!response.ok) {
      shiprocketLogger.error('Failed to fetch Shiprocket pickup locations', {
        status: response.status,
        response: shiprocketResponse
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pickup locations from Shiprocket', details: shiprocketResponse },
        { status: 500 }
      );
    }

    shiprocketLogger.info('Successfully fetched Shiprocket pickup locations', {
      totalLocations: shiprocketResponse.data?.shipping_address?.length || 0
    });

    return NextResponse.json({
      success: true,
      data: shiprocketResponse.data?.shipping_address || []
    });

  } catch (error) {
    shiprocketLogger.error('Error fetching Shiprocket pickup locations', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pickup locations' },
      { status: 500 }
    );
  }
}

// POST - Add new pickup location
export async function POST(request) {
  try {
    const pickupData = await request.json();

    shiprocketLogger.info('Adding new Shiprocket pickup location', { 
      pickupName: pickupData.pickup_location 
    });

    // Validate required fields
    const requiredFields = [
      'pickup_location', 'name', 'email', 'phone', 'address', 
      'address_2', 'city', 'state', 'country', 'pin_code'
    ];
    
    for (const field of requiredFields) {
      if (!pickupData[field] && field !== 'address_2') { // address_2 is optional
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();

    // Add pickup location to Shiprocket
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/addpickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pickupData)
    });

    const shiprocketResponse = await response.json();

    if (!response.ok) {
      shiprocketLogger.error('Failed to add Shiprocket pickup location', {
        status: response.status,
        response: shiprocketResponse,
        pickupData
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to add pickup location to Shiprocket', details: shiprocketResponse },
        { status: response.status }
      );
    }

    shiprocketLogger.info('Successfully added Shiprocket pickup location', {
      pickupName: pickupData.pickup_location,
      response: shiprocketResponse
    });

    return NextResponse.json({
      success: true,
      data: shiprocketResponse,
      message: 'Pickup location added successfully'
    });

  } catch (error) {
    shiprocketLogger.error('Error adding Shiprocket pickup location', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to add pickup location' },
      { status: 500 }
    );
  }
}
