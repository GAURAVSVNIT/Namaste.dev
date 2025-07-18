import { addDoc, collection, db, serverTimestamp } from '../lib/firebase.js';

const sampleProducts = [
  // Merchant 1: TechStore
  {
    name: 'MacBook Pro 16-inch',
    description: 'Powerful laptop with M2 chip, 16GB RAM, 512GB SSD',
    price: 2499,
    originalPrice: 2799,
    category: 'Electronics',
    merchantId: 'merchant_techstore_001',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    rating: 4.8,
    views: 245
  },
  {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 chip, 128GB storage, Pro camera system',
    price: 999,
    originalPrice: 1099,
    category: 'Electronics',
    merchantId: 'merchant_techstore_001',
    stock: 32,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    rating: 4.9,
    views: 432
  },
  {
    name: 'Sony WH-1000XM4 Headphones',
    description: 'Industry-leading noise canceling with dual microphones',
    price: 348,
    originalPrice: 399,
    category: 'Electronics',
    merchantId: 'merchant_techstore_001',
    stock: 28,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    rating: 4.7,
    views: 189
  },

  // Merchant 2: FashionHub
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt, available in multiple colors',
    price: 29,
    originalPrice: 39,
    category: 'Clothing',
    merchantId: 'merchant_fashionhub_002',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    rating: 4.5,
    views: 67
  },
  {
    name: 'Leather Jacket',
    description: 'Genuine leather jacket with premium quality and modern design',
    price: 199,
    originalPrice: 249,
    category: 'Clothing',
    merchantId: 'merchant_fashionhub_002',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    rating: 4.6,
    views: 123
  },
  {
    name: 'Designer Sneakers',
    description: 'Trendy sneakers with comfortable sole and breathable material',
    price: 89,
    originalPrice: 120,
    category: 'Clothing',
    merchantId: 'merchant_fashionhub_002',
    stock: 23,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    rating: 4.4,
    views: 98
  },

  // Merchant 3: BookNook
  {
    name: 'The Psychology of Programming',
    description: 'Classic book on software development and programming psychology',
    price: 24,
    originalPrice: 29,
    category: 'Books',
    merchantId: 'merchant_booknook_003',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    rating: 4.7,
    views: 45
  },
  {
    name: 'Clean Code: A Handbook',
    description: 'Essential guide to writing clean, maintainable code',
    price: 32,
    originalPrice: 40,
    category: 'Books',
    merchantId: 'merchant_booknook_003',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.8,
    views: 78
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Discover the beautiful, elegant, lightweight subset of JavaScript',
    price: 18,
    originalPrice: 25,
    category: 'Books',
    merchantId: 'merchant_booknook_003',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    rating: 4.6,
    views: 56
  },

  // Merchant 4: HomeDecor
  {
    name: 'Modern Table Lamp',
    description: 'Elegant table lamp with adjustable brightness and USB charging',
    price: 45,
    originalPrice: 65,
    category: 'Home & Garden',
    merchantId: 'merchant_homedecor_004',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    rating: 4.3,
    views: 34
  },
  {
    name: 'Ceramic Plant Pot Set',
    description: 'Set of 3 ceramic plant pots with drainage holes and saucers',
    price: 36,
    originalPrice: 48,
    category: 'Home & Garden',
    merchantId: 'merchant_homedecor_004',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
    rating: 4.5,
    views: 29
  },
  {
    name: 'Wall Art Canvas Print',
    description: 'Beautiful abstract canvas print, ready to hang wall art',
    price: 68,
    originalPrice: 89,
    category: 'Home & Garden',
    merchantId: 'merchant_homedecor_004',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    rating: 4.4,
    views: 42
  },

  // Merchant 5: GadgetWorld
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charger compatible with all Qi-enabled devices',
    price: 25,
    originalPrice: 35,
    category: 'Electronics',
    merchantId: 'merchant_gadgetworld_005',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1609592035476-4b8b6ed75b9d?w=400',
    rating: 4.2,
    views: 67
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360-degree sound and 12-hour battery',
    price: 79,
    originalPrice: 99,
    category: 'Electronics',
    merchantId: 'merchant_gadgetworld_005',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    rating: 4.6,
    views: 134
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracker with heart rate monitor and GPS functionality',
    price: 149,
    originalPrice: 199,
    category: 'Electronics',
    merchantId: 'merchant_gadgetworld_005',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.5,
    views: 298
  },

  // Merchant 6: CoffeeCorner
  {
    name: 'Premium Coffee Beans',
    description: 'Single-origin arabica coffee beans, medium roast, 1lb bag',
    price: 18,
    originalPrice: 24,
    category: 'Food & Beverages',
    merchantId: 'merchant_coffeecorner_006',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=400',
    rating: 4.7,
    views: 87
  },
  {
    name: 'French Press Coffee Maker',
    description: 'Borosilicate glass French press with stainless steel filter',
    price: 35,
    originalPrice: 45,
    category: 'Food & Beverages',
    merchantId: 'merchant_coffeecorner_006',
    stock: 16,
    image: 'https://images.unsplash.com/photo-1545013269-2d0ac17e6c5c?w=400',
    rating: 4.4,
    views: 54
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs with unique designs',
    price: 42,
    originalPrice: 56,
    category: 'Food & Beverages',
    merchantId: 'merchant_coffeecorner_006',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400',
    rating: 4.6,
    views: 33
  }
];

export async function populateMarketplace() {
  try {
    console.log('Starting to populate marketplace with sample products...');
    
    for (const product of sampleProducts) {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log(`Added product: ${product.name} (ID: ${docRef.id})`);
    }
    
    console.log(`Successfully added ${sampleProducts.length} products to the marketplace!`);
    
  } catch (error) {
    console.error('Error populating marketplace:', error);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateMarketplace();
}
