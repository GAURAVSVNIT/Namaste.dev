import { NextResponse } from 'next/server';
import { getDocs, collection, db } from '../../../lib/firebase';

export async function GET() {
  try {
    // Get all products from Firebase
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group products by merchant
    const merchantGroups = products.reduce((acc, product) => {
      const merchantId = product.merchantId || 'unknown';
      if (!acc[merchantId]) {
        acc[merchantId] = [];
      }
      acc[merchantId].push(product);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      merchantGroups,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        merchantId: p.merchantId,
        image: p.image || p.imageUrl
      }))
    });
  } catch (error) {
    console.error('Error in test sync:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
