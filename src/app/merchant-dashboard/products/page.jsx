'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import styles from './Products.module.css';
import ProductModal from '@/components/merchant-dashboard/ProductModal';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

function ProductsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [shiprocketProducts, setShiprocketProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from Shiprocket
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const tokenResponse = await fetch('/api/merchant/shiprocket/auth-token'); // Ensure you have this endpoint to get token
        const tokenData = await tokenResponse.json();

        const response = await fetch('https://apiv2.shiprocket.in/v1/external/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`
          }
        });

        const data = await response.json();
        setShiprocketProducts(data.data || []);
      } catch (error) {
        console.error('Error loading Shiprocket products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = shiprocketProducts.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // TODO: Implement Shiprocket product deletion
      // For now, just remove from local state
      setShiprocketProducts(prev => prev.filter(p => p.id !== productId));
      console.log('Product deleted from local state. Shiprocket deletion not implemented yet.');
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
        const tokenResponse = await fetch('/api/merchant/shiprocket/auth-token');
        const tokenData = await tokenResponse.json();

        const response = await fetch('https://apiv2.shiprocket.in/v1/external/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`
          }
        });

        const data = await response.json();
        setShiprocketProducts(data.data || []);
      } catch (error) {
        console.error('Error refreshing Shiprocket products:', error);
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
                      e.target.style.display = 'none';
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
                  <span className={styles.productPrice}>₹{parseFloat(product.mrp || 0).toFixed(2)}</span>
                </div>
                <p className={styles.productDescription}>
                  {product.description || 'No description available'}
                </p>
                <div className={styles.productFooter}>
                  <span className={`${styles.stockStatus} ${product.quantity > 0 ? styles.inStock : styles.outOfStock}`}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
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

// Main component with role protection
export default function ProductsPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT, USER_ROLES.ADMIN]}>
      <ProductsPageContent />
    </RoleProtected>
  );
}
