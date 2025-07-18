import { NextResponse } from 'next/server';
import { 
  getDocs, 
  collection, 
  db, 
  query, 
  orderBy, 
  where, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from '../../../lib/firebase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const merchant = searchParams.get('merchant');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit')) || 50;

    let productsQuery = collection(db, 'products');

    // Add filters
    const constraints = [];
    
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }
    
    if (merchant && merchant !== 'all') {
      constraints.push(where('merchantId', '==', merchant));
    }

    // Add sorting
    switch (sortBy) {
      case 'price-low':
        constraints.push(orderBy('price', 'asc'));
        break;
      case 'price-high':
        constraints.push(orderBy('price', 'desc'));
        break;
      case 'name':
        constraints.push(orderBy('name', 'asc'));
        break;
      case 'newest':
      default:
        constraints.push(orderBy('createdAt', 'desc'));
        break;
    }

    if (constraints.length > 0) {
      productsQuery = query(productsQuery, ...constraints);
    }

    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    // Get unique merchants
    const merchants = [...new Set(products.map(p => p.merchantId))]
      .filter(Boolean)
      .map(merchantId => ({ id: merchantId, name: merchantId }));

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))]
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        products,
        merchants,
        categories,
        total: products.length
      }
    });

  } catch (error) {
    console.error('Error fetching marketplace data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'add_to_cart':
        return await addToCart(data);
      case 'create_order':
        return await createOrder(data);
      case 'update_product_views':
        return await updateProductViews(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in marketplace POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function addToCart(data) {
  const { userId, productId, quantity = 1 } = data;

  if (!userId || !productId) {
    return NextResponse.json(
      { success: false, error: 'User ID and Product ID are required' },
      { status: 400 }
    );
  }

  try {
    // Get product details
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productDoc.data();

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Add to cart collection
    const cartItem = {
      userId,
      productId,
      quantity,
      price: product.price,
      merchantId: product.merchantId,
      productName: product.name,
      productImage: product.image,
      addedAt: serverTimestamp()
    };

    const cartRef = await addDoc(collection(db, 'cart'), cartItem);

    return NextResponse.json({
      success: true,
      data: { cartId: cartRef.id, ...cartItem }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

async function createOrder(data) {
  const { userId, items, shippingAddress, paymentMethod } = data;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Invalid order data' },
      { status: 400 }
    );
  }

  try {
    // Calculate total and validate products
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const productDoc = await getDoc(doc(db, 'products', item.productId));
      if (!productDoc.exists()) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const product = productDoc.data();
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
        merchantId: product.merchantId
      });
    }

    // Create order
    const order = {
      userId,
      items: orderItems,
      total,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const orderRef = await addDoc(collection(db, 'orders'), order);

    // Update product stock
    for (const item of items) {
      const productRef = doc(db, 'products', item.productId);
      const productDoc = await getDoc(productRef);
      const currentStock = productDoc.data().stock;
      
      await updateDoc(productRef, {
        stock: currentStock - item.quantity,
        updatedAt: serverTimestamp()
      });
    }

    return NextResponse.json({
      success: true,
      data: { orderId: orderRef.id, ...order }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

async function updateProductViews(data) {
  const { productId } = data;

  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'Product ID is required' },
      { status: 400 }
    );
  }

  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const currentViews = productDoc.data().views || 0;
    await updateDoc(productRef, {
      views: currentViews + 1,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      data: { views: currentViews + 1 }
    });

  } catch (error) {
    console.error('Error updating product views:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update views' },
      { status: 500 }
    );
  }
}
