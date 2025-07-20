import { getValidShiprocketToken } from '@/lib/shiprocket';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = await getValidShiprocketToken();
    
    return NextResponse.json({ 
      success: true, 
      token: token 
    });
  } catch (error) {
    console.error('Error getting Shiprocket token:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get Shiprocket token',
      message: error.message 
    }, { status: 500 });
  }
}
