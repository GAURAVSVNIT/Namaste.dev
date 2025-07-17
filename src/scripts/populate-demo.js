const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProducts = [
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
  {
    name: 'Summer Sandals',
    description: 'Comfortable summer sandals with adjustable straps and cushioned sole',
    price: 45,
    originalPrice: 60,
    category: 'Footwear',
    merchantId: 'merchant_solestyle_003',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    rating: 4.3,
    views: 89
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
  },
  {
    name: 'Classic Sunglasses',
    description: 'Timeless sunglasses with UV protection and durable frame',
    price: 65,
    originalPrice: 85,
    category: 'Accessories',
    merchantId: 'merchant_accessoryworld_004',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    rating: 4.4,
    views: 145
  },

  // Merchant 5: DenimCo - Specialized Denim
  {
    name: 'Vintage Denim Jacket',
    description: 'Classic denim jacket with vintage wash and authentic details',
    price: 85,
    originalPrice: 110,
    category: 'Denim',
    merchantId: 'merchant_denimco_005',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    rating: 4.7,
    views: 267
  },
  {
    name: 'Skinny Jeans',
    description: 'Premium skinny jeans with stretch fabric and perfect fit',
    price: 70,
    originalPrice: 90,
    category: 'Denim',
    merchantId: 'merchant_denimco_005',
    stock: 32,
    image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400',
    rating: 4.5,
    views: 198
  },
  {
    name: 'Distressed Denim Shorts',
    description: 'Trendy distressed denim shorts with frayed edges and comfortable fit',
    price: 45,
    originalPrice: 60,
    category: 'Denim',
    merchantId: 'merchant_denimco_005',
    stock: 28,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    rating: 4.3,
    views: 123
  },

  // Merchant 6: ActiveWear - Sportswear
  {
    name: 'Yoga Leggings',
    description: 'High-performance yoga leggings with moisture-wicking fabric',
    price: 55,
    originalPrice: 70,
    category: 'Activewear',
    merchantId: 'merchant_activewear_006',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1506629905607-8dcc44217b85?w=400',
    rating: 4.6,
    views: 289
  },
  {
    name: 'Sports Bra',
    description: 'Supportive sports bra with breathable fabric and comfortable fit',
    price: 35,
    originalPrice: 45,
    category: 'Activewear',
    merchantId: 'merchant_activewear_006',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    rating: 4.7,
    views: 156
  },
  {
    name: 'Running Shorts',
    description: 'Lightweight running shorts with built-in compression and pockets',
    price: 40,
    originalPrice: 55,
    category: 'Activewear',
    merchantId: 'merchant_activewear_006',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
    rating: 4.4,
    views: 98
  }
];

async function populateMarketplace() {
  try {
    console.log('Starting to populate marketplace with sample products...');
    
    for (const product of sampleProducts) {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log(`✓ Added product: ${product.name} (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 Successfully added ${sampleProducts.length} products to the marketplace!`);
    console.log('\nFashion Merchants added:');
    console.log('- FashionHub (Womens Clothing)');
    console.log('- UrbanStyle (Mens Clothing)');
    console.log('- SoleStyle (Footwear)');
    console.log('- AccessoryWorld (Accessories)');
    console.log('- DenimCo (Denim)');
    console.log('- ActiveWear (Activewear)');
    
  } catch (error) {
    console.error('❌ Error populating marketplace:', error);
  }
}

populateMarketplace();
