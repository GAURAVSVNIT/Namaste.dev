'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, db } from '../../../../lib/firebase';
import { Star, ShieldCheck, Truck, Package, Minus, Plus, Heart, Share2, ArrowLeft, ShoppingCart } from 'lucide-react';
import useCartStore from '../../../../store/cart-store';
import { formatCurrency } from '../../../../lib/utils';
import '../../../../static/ProductPage.css';
import Navbar from '../../../../components/Navbar';
import ChatButton from '../../../../components/chat/ChatButton';

const ProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, openCart } = useCartStore();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const productRef = doc(db, 'products', id);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const productData = { id: productSnap.id, ...productSnap.data() };
            let imageArray = [];
            if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
              imageArray = productData.images;
            } else if (productData.image) {
              imageArray = [productData.image];
            }
            productData.images = imageArray;
            setProduct(productData);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, Math.min(prev + amount, product?.stock || 10)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
    openCart();
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
  };

  const productImages = product?.images?.length > 0 
    ? product.images 
    : ['/api/placeholder/600/600'];

  const renderSkeleton = () => (
    <div className="product-page-container">
      <Navbar />
      <div className="product-page-content">
        <div className="product-header">
          <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
        </div>
        <div className="product-grid">
          <div className="product-gallery">
            <div className="main-image-wrapper skeleton"></div>
            <div className="thumbnails">
              {[...Array(4)].map((_, i) => <div key={i} className="thumbnail-button skeleton"></div>)}
            </div>
          </div>
          <div className="product-details">
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '2.5rem' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '30%', height: '2rem', marginTop: '1rem' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%', marginTop: '1rem' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return renderSkeleton();

  if (!product) {
    return (
      <div className="product-page-container">
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-lg text-gray-600 mb-4">Product not found.</p>
          <button onClick={() => router.back()} className="back-button">
            <ArrowLeft size={20} />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <Navbar />
      <div className="product-page-content">
        <div className="product-header">
          <button onClick={() => router.back()} className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Marketplace</span>
          </button>
        </div>

        <div className="product-grid">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img 
                src={productImages[activeImage]} 
                alt={product.name}
                className="main-image"
              />
            </div>
            <div className="thumbnails">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`thumbnail-button ${index === activeImage ? 'active' : ''}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating-section">
              <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" className={`${i < Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="reviews-text">({(product.reviews || 0).toLocaleString()} reviews)</span>
            </div>

            <div className="product-price-section">
              <span className="current-price">{formatCurrency(product.price || 0)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            <p className="product-description">
              {product.description || 'No description available for this product.'}
            </p>

            <div className="stock-status">
              <div className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></div>
              <span className={`stock-text ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            <div className="actions-wrapper">
              <div className="quantity-selector">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-control">
                  <button onClick={() => handleQuantityChange(-1)} className="quantity-btn"><Minus size={16} /></button>
                  <span className="quantity-value">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="quantity-btn"><Plus size={16} /></button>
                </div>
              </div>
              <div className="button-group">
                <button onClick={handleBuyNow} className="btn btn-buy-now">Buy Now</button>
                <button onClick={handleAddToCart} className="btn btn-add-to-cart">
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="trust-signals">
              <div className="trust-signal-item">
                <div className="trust-signal-icon shipping"><Truck size={20} /></div>
                <div className="trust-signal-text">
                  <h4>Free Shipping</h4>
                  <p>On orders over ₹200</p>
                </div>
              </div>
              <div className="trust-signal-item">
                <div className="trust-signal-icon payment"><ShieldCheck size={20} /></div>
                <div className="trust-signal-text">
                  <h4>Secure Payment</h4>
                  <p>100% protected</p>
                </div>
              </div>
              <div className="trust-signal-item">
                <div className="trust-signal-icon returns"><Package size={20} /></div>
                <div className="trust-signal-text">
                  <h4>Easy Returns</h4>
                  <p>30-day guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ChatButton product={product} />
    </div>
  );
};

export default ProductPage;
