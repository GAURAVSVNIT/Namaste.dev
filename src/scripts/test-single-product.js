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

async function addSingleProduct() {
  try {
    const product = {
      name: 'Test T-Shirt',
      description: 'A simple test product',
      price: 25,
      originalPrice: 30,
      category: 'Mens Clothing',
      merchantId: 'test_merchant_001',
      stock: 10,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      rating: 4.5,
      views: 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Adding single test product...');
    const docRef = await addDoc(collection(db, 'products'), product);
    console.log(`✓ Product added with ID: ${docRef.id}`);
    
  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
}

addSingleProduct();
