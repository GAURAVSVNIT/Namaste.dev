'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import styles from './Products.module.css';
import { getDocs, collection, db, deleteDoc, doc } from '@/lib/firebase';
import ProductModal from '@/components/merchant-dashboard/ProductModal';

export default function ProductsPage() {
  const { state, dispatch } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [firebaseProducts, setFirebaseProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFirebaseProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Use Firebase products if available, otherwise fallback to local state
  const allProducts = firebaseProducts.length > 0 ? firebaseProducts : state.products;
  
  const filteredProducts = allProducts.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'products', productId));
      
      // Update local state
      setFirebaseProducts(prev => prev.filter(p => p.id !== productId));
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    // Refresh products after modal closes
    const refreshProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFirebaseProducts(products);
      } catch (error) {
        console.error('Error refreshing products:', error);
      }
    };
    refreshProducts();
  };

  return (
    <div className={styles.productsPage}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className={styles.title}>Products</h1>
        <p className={styles.subtitle}>Manage your product catalog</p>
      </motion.header>

      {/* Search and Actions */}
      <div className={styles.actions}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className={styles.addButton}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Package size={40} />
          </div>
          <h3 className={styles.emptyStateTitle}>No products found</h3>
          <p className={styles.emptyStateDescription}>
            You haven't added any products yet. Get started by adding your first product to your catalog.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.addButton}
            style={{ margin: '0 auto' }}
          >
            <Plus size={18} />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              className={styles.productCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.productImageContainer}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                ) : (
                  <div className={styles.productImagePlaceholder}>
                    <Package size={40} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className={styles.productContent}>
                <div className={styles.productHeader}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span className={styles.productPrice}>${product.price?.toFixed(2) || '0.00'}</span>
                </div>
                <p className={styles.productDescription}>
                  {product.description || 'No description available'}
                </p>
                <div className={styles.productFooter}>
                  <span className={`${styles.stockStatus} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <div className={styles.actions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                      className={`${styles.actionButton} ${styles.editButton}`}
                      aria-label="Edit product"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          handleDeleteProduct(product.id);
                        }
                      }}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      aria-label="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            product={editingProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
}