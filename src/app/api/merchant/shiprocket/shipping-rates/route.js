import { NextResponse } from 'next/server';
import { getValidShiprocketToken } from '@/lib/shiprocket';
import { shiprocketLogger } from '@/lib/logger';

export async function POST(request) {
  try {
    const {
      pincode,
      codAmount = 0,
      weight = 0.5,
      length = 10,
      breadth = 10,
      height = 10,
      items = []
    } = await request.json();

    shiprocketLogger.info('Fetching shipping rates', { pincode, weight, codAmount });

    // Validate required fields
    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'Pincode is required' },
        { status: 400 }
      );
    }

    // Get valid Shiprocket token
    const token = await getValidShiprocketToken();

    // Calculate total weight based on items or use default
    let totalWeight = weight;
    if (items && items.length > 0) {
      // Estimate weight: 0.5kg per item as default
      totalWeight = items.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);
    }

    // Ensure minimum weight
    totalWeight = Math.max(totalWeight, 0.1);

    // Get pickup location dynamically
    let pickupPincode = "110001"; // Default fallback
    shiprocketLogger.info('Fetching pickup location from Shiprocket API');
    
    try {
      const pickupResponse = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      shiprocketLogger.info('Pickup location API response', {
        status: pickupResponse.status,
        statusText: pickupResponse.statusText,
        ok: pickupResponse.ok
      });
      
      if (pickupResponse.ok) {
        const pickupData = await pickupResponse.json();
        shiprocketLogger.info('Pickup location data received', {
          hasData: !!pickupData.data,
          addressCount: pickupData.data?.shipping_address?.length || 0
        });
        
        const primaryLocation = pickupData.data?.shipping_address?.find(addr => addr.is_primary_location === 1);
        if (primaryLocation) {
          pickupPincode = primaryLocation.pin_code;
          shiprocketLogger.info('Primary pickup location found', {
            pickupPincode,
            locationName: primaryLocation.pickup_location,
            city: primaryLocation.city,
            state: primaryLocation.state
          });
        } else {
          shiprocketLogger.warn('No primary pickup location found', {
            availableLocations: pickupData.data?.shipping_address?.map(addr => ({
              id: addr.id,
              location: addr.pickup_location,
              pincode: addr.pin_code,
              isPrimary: addr.is_primary_location
            })) || []
          });
        }
      } else {
        const errorData = await pickupResponse.text();
        shiprocketLogger.error('Pickup location API failed', {
          status: pickupResponse.status,
          statusText: pickupResponse.statusText,
          errorData
        });
      }
    } catch (error) {
      shiprocketLogger.error('Failed to fetch pickup location', {
        error: error.message,
        stack: error.stack,
        fallbackPincode: pickupPincode
      });
    }

    // Build shipping rate request data
    const rateRequestData = {
      pickup_postcode: pickupPincode,
      delivery_postcode: pincode,
      weight: totalWeight.toString(),
      cod: codAmount > 0 ? 1 : 0,
      length: length.toString(),
      breadth: breadth.toString(),
      height: height.toString()
    };

    shiprocketLogger.info('Shiprocket rate request', {
      pickup_postcode: rateRequestData.pickup_postcode,
      delivery_postcode: rateRequestData.delivery_postcode,
      weight: rateRequestData.weight,
      cod: rateRequestData.cod
    });

    // For serviceability check, we need to use GET with query params
    const queryParams = new URLSearchParams(rateRequestData);
    const serviceabilityUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${queryParams}`;
    
    shiprocketLogger.info('Making serviceability API request', {
      url: serviceabilityUrl,
      params: rateRequestData
    });
    
    const serviceabilityResponse = await fetch(serviceabilityUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    shiprocketLogger.info('Serviceability API response', {
      status: serviceabilityResponse.status,
      statusText: serviceabilityResponse.statusText,
      ok: serviceabilityResponse.ok
    });

    const shiprocketResponse = await serviceabilityResponse.json();

    if (!serviceabilityResponse.ok) {
      shiprocketLogger.error('Shiprocket serviceability check failed', {
        status: serviceabilityResponse.status,
        statusText: serviceabilityResponse.statusText,
        requestParams: rateRequestData,
        response: shiprocketResponse,
        url: serviceabilityUrl
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch shipping rates', 
          details: shiprocketResponse,
          debug: {
            status: serviceabilityResponse.status,
            params: rateRequestData
          }
        },
        { status: 500 }
      );
    }

    shiprocketLogger.info('Successfully fetched shipping rates', {
      availableCouriers: shiprocketResponse.data?.available_courier_companies?.length || 0,
      currency: shiprocketResponse.currency,
      companyInsurance: shiprocketResponse.company_auto_shipment_insurance_setting
    });
    
    // Log courier details for debugging
    if (shiprocketResponse.data?.available_courier_companies) {
      shiprocketLogger.info('Available couriers', {
        couriers: shiprocketResponse.data.available_courier_companies.map(courier => ({
          id: courier.courier_company_id,
          name: courier.courier_name,
          rate: courier.rate,
          codCharges: courier.cod_charges,
          estimatedDays: courier.estimated_delivery_days,
          codAvailable: courier.cod === 1
        }))
      });
    }

    // Transform and sort the shipping options
    const shippingOptions = [];

    if (shiprocketResponse.data?.available_courier_companies) {
      shiprocketResponse.data.available_courier_companies.forEach(courier => {
        // Add standard delivery option
        if (courier.rate && courier.estimated_delivery_days) {
          shippingOptions.push({
            id: `${courier.courier_company_id}_standard`,
            courier_company_id: courier.courier_company_id,
            courier_name: courier.courier_name,
            service_type: 'Standard',
            rate: parseFloat(courier.rate),
            cod_charges: parseFloat(courier.cod_charges || 0),
            freight_charge: parseFloat(courier.freight_charge || 0),
            other_charges: parseFloat(courier.other_charges || 0),
            total_charge: parseFloat(courier.rate) + parseFloat(courier.cod_charges || 0),
            estimated_delivery_days: courier.estimated_delivery_days,
            delivery_performance: courier.delivery_performance || 0,
            rating: courier.rating || 0,
            recommend: courier.recommend === "1" || courier.recommend === 1,
            cod_available: courier.cod === 1 || courier.cod === "1",
            tracking_available: true
          });
        }

        // Add express delivery option if available (usually 1-2 days faster)
        if (courier.rate && courier.estimated_delivery_days && courier.estimated_delivery_days > 1) {
          const expressDeliveryDays = Math.max(1, courier.estimated_delivery_days - 1);
          const expressRate = parseFloat(courier.rate) * 1.5; // Express typically costs 50% more
          
          shippingOptions.push({
            id: `${courier.courier_company_id}_express`,
            courier_company_id: courier.courier_company_id,
            courier_name: courier.courier_name,
            service_type: 'Express',
            rate: expressRate,
            cod_charges: parseFloat(courier.cod_charges || 0),
            freight_charge: parseFloat(courier.freight_charge || 0),
            other_charges: parseFloat(courier.other_charges || 0),
            total_charge: expressRate + parseFloat(courier.cod_charges || 0),
            estimated_delivery_days: expressDeliveryDays,
            delivery_performance: courier.delivery_performance || 0,
            rating: courier.rating || 0,
            recommend: false, // Express is not usually the recommended default
            cod_available: courier.cod === 1 || courier.cod === "1",
            tracking_available: true
          });
        }
      });
    }

    // Sort options by total charge (cheapest first)
    shippingOptions.sort((a, b) => a.total_charge - b.total_charge);

    // Log processed shipping options
    shiprocketLogger.info('Processed shipping options', {
      optionsCount: shippingOptions.length,
      options: shippingOptions.map(option => ({
        id: option.id,
        courier: option.courier_name,
        totalCharge: option.total_charge,
        deliveryDays: option.estimated_delivery_days,
        recommended: option.recommend
      }))
    });
    
    // If no shipping options available, provide a default local delivery option
    if (shippingOptions.length === 0) {
      shiprocketLogger.warn('No shipping options found, providing fallback local delivery', {
        pickupPincode,
        deliveryPincode: pincode,
        weight: totalWeight
      });
      
      shippingOptions.push({
        id: 'local_delivery',
        courier_company_id: 'local',
        courier_name: 'Local Delivery',
        service_type: 'Standard',
        rate: 50,
        cod_charges: codAmount > 0 ? 20 : 0,
        freight_charge: 50,
        other_charges: 0,
        total_charge: 50 + (codAmount > 0 ? 20 : 0),
        estimated_delivery_days: '3-5',
        delivery_performance: 85,
        rating: 4.0,
        recommend: true,
        cod_available: true,
        tracking_available: false
      });
    }

    const finalResponse = {
      success: true,
      data: {
        shipping_options: shippingOptions,
        pincode: pincode,
        pickup_pincode: pickupPincode,
        serviceable: shippingOptions.length > 0,
        weight: totalWeight,
        cod_available: shippingOptions.some(option => option.cod_available)
      }
    };
    
    shiprocketLogger.info('Shipping rates API response', {
      success: true,
      optionsCount: shippingOptions.length,
      serviceable: finalResponse.data.serviceable,
      pickupPincode,
      deliveryPincode: pincode
    });
    
    return NextResponse.json(finalResponse);

  } catch (error) {
    shiprocketLogger.error('Error fetching shipping rates', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
}
