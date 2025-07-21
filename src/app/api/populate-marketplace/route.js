import { NextResponse } from 'next/server';
import { 
  addDoc, 
  collection, 
  db, 
  serverTimestamp 
} from '../../../lib/firebase';

const fashionProducts = [
  // Merchant 1: FashionHub - Women's Clothing
  {
    name: 'Elegant Maxi Dress',
    description: 'Flowing maxi dress with floral print, perfect for summer occasions',
    price: 89,
    originalPrice: 120,
    category: 'Womens Clothing',
    merchantId: 'merchant_fashionhub_001',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    rating: 4.7,
    views: 234
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with vintage wash and comfortable fit',
    price: 75,
    originalPrice: 95,
    category: 'Womens Clothing',
    merchantId: 'merchant_fashionhub_001',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    rating: 4.5,
    views: 189
  },
  {
    name: 'High-Waisted Jeans',
    description: 'Comfortable high-waisted jeans with stretch fabric and modern cut',
    price: 65,
    originalPrice: 85,
    category: 'Womens Clothing',
    merchantId: 'merchant_fashionhub_001',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
    rating: 4.6,
    views: 298
  },

  // Merchant 2: UrbanStyle - Men's Fashion
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Soft cotton t-shirt with modern fit, available in multiple colors',
    price: 29,
    originalPrice: 39,
    category: 'Mens Clothing',
    merchantId: 'merchant_urbanstyle_002',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    rating: 4.4,
    views: 167
  },
  {
    name: 'Casual Blazer',
    description: 'Smart-casual blazer perfect for work or weekend events',
    price: 145,
    originalPrice: 180,
    category: 'Mens Clothing',
    merchantId: 'merchant_urbanstyle_002',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.8,
    views: 143
  },
  {
    name: 'Slim Fit Chinos',
    description: 'Classic chino pants with slim fit and premium cotton blend',
    price: 55,
    originalPrice: 75,
    category: 'Mens Clothing',
    merchantId: 'merchant_urbanstyle_002',
    stock: 28,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    rating: 4.5,
    views: 201
  },

  // Merchant 3: SoleStyle - Footwear
  {
    name: 'Designer Sneakers',
    description: 'Trendy sneakers with comfortable sole and breathable material',
    price: 89,
    originalPrice: 120,
    category: 'Footwear',
    merchantId: 'merchant_solestyle_003',
    stock: 23,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    rating: 4.4,
    views: 312
  },
  {
    name: 'Leather Ankle Boots',
    description: 'Genuine leather ankle boots with modern design and comfortable heel',
    price: 125,
    originalPrice: 160,
    category: 'Footwear',
    merchantId: 'merchant_solestyle_003',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
    rating: 4.7,
    views: 156
  },

  // Merchant 4: AccessoryWorld - Fashion Accessories
  {
    name: 'Leather Handbag',
    description: 'Elegant leather handbag with multiple compartments and adjustable strap',
    price: 95,
    originalPrice: 130,
    category: 'Accessories',
    merchantId: 'merchant_accessoryworld_004',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    rating: 4.6,
    views: 178
  },
  {
    name: 'Statement Necklace',
    description: 'Bold statement necklace with gold-plated finish and geometric design',
    price: 35,
    originalPrice: 50,
    category: 'Accessories',
    merchantId: 'merchant_accessoryworld_004',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    rating: 4.5,
    views: 234
  }
];

export async function POST(request) {
  try {
    const results = [];
    
    console.log('Starting to populate marketplace with fashion products...');
    
    for (const product of fashionProducts) {
      try {
        const productData = {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        const docRef = await addDoc(collection(db, 'products'), productData);
        results.push({
          success: true,
          id: docRef.id,
          name: product.name
        });
        
        console.log(`✓ Added product: ${product.name} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error adding product ${product.name}:`, error);
        results.push({
          success: false,
          name: product.name,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${successCount} products. ${failCount} failed.`,
      results,
      merchants: [
        'FashionHub (Womens Clothing)',
        'UrbanStyle (Mens Clothing)', 
        'SoleStyle (Footwear)',
        'AccessoryWorld (Accessories)'
      ]
    });
    
  } catch (error) {
    console.error('Error populating marketplace:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to populate marketplace',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to populate marketplace with fashion products',
    endpoint: '/api/populate-marketplace',
    method: 'POST'
  });
}
