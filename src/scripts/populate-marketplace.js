import { addDoc, collection, db, serverTimestamp } from '../lib/firebase.js';

const sampleProducts = [

  // Merchant 2: FashionHub
{
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt, available in multiple colors',
    price: 29,
    originalPrice: 39,
    category: 'Women',
    merchantId: 'merchant_fashionhub_002',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    rating: 4.5,
    views: 67
  },
  {
name: "Men's Casual Shirt",
    description: 'Perfect for casual outings with a comfortable fit',
    price: 45,
    originalPrice: 55,
    category: 'Men',
    merchantId: 'merchant_fashionhub_002',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1530845646912-b4b33f5a4c99?w=400',
    rating: 4.3,
    views: 89
  },
  {
name: "Boys' Denim Jacket",
    description: 'Trendy denim jacket for boys, great for all seasons',
    price: 60,
    originalPrice: 75,
    category: 'Boys',
    merchantId: 'merchant_fashionhub_002',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1596495767084-bd043bd798c7?w=400',
    rating: 4.2,
    views: 56
  },
  {
name: "Girls' Floral Dress",
    description: 'Beautiful floral dress for special occasions',
    price: 80,
    originalPrice: 100,
    category: 'Girls',
    merchantId: 'merchant_fashionhub_002',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1523381212740-e99140b91689?w=400',
    rating: 4.7,
    views: 120
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
