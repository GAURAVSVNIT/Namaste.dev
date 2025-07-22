'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import styles from './ProductModal.module.css';
import { 
  storage,
  addProduct,
  updateProduct
} from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function ProductModal({ product, onClose, isOpen = true }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || '',
    imageUrl: product?.imageUrl || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  }, []);

  const handleImageFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const createProductInShiprocket = async (productData) => {
    try {
      // Generate unique SKU
      const sku = `${productData.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
      
      // Map local product data to Shiprocket format
      const shiprocketProduct = {
        name: productData.name,
        category_code: "default",
        type: "Single",
        qty: parseInt(productData.stock) || 0,
        sku: sku,
        description: productData.description || "",
        cost_price: parseFloat(productData.price) || 0,
        mrp: parseFloat(productData.price) || 0,
        weight: 0.5, // Default weight in kg
        length: 10, // Default dimensions in cm
        width: 10,
        height: 10,
        image_url: productData.image || productData.imageUrl || "",
        
        // QC Details
        qc_details: {
          product_image: productData.image || productData.imageUrl || "",
          brand: "Namaste.dev",
          color: "",
          size: "",
          product_imei: "",
          serial_no: sku,
          ean_barcode: "",
          check_damaged_product: true
        }
      };
      
      const response = await fetch('/api/merchant/shiprocket/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiprocketProduct),
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        console.error('Shiprocket API request failed:', response.status, response.statusText);
        return; // Exit early if request failed
      }
      
      const responseText = await response.text();
      if (!responseText) {
        console.error('Empty response from Shiprocket API');
        return;
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Shiprocket response:', parseError);
        console.error('Response text:', responseText);
        return;
      }
      
      if (!result.success) {
        console.error('Failed to create product in Shiprocket:', result.error);
        // Don't throw error - let the product still be created locally
      } else {
        console.log('Product created successfully in Shiprocket:', result.data);
      }
    } catch (error) {
      console.error('Error creating product in Shiprocket:', error);
      // Don't throw error - let the product still be created locally
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const productData = {
        ...formData,
        imageUrl,
        image: imageUrl, // Also set 'image' field for marketplace compatibility
        merchantId: 'current_merchant_001', // TODO: Get from auth context
        rating: 4.5,
        views: 0,
      };

      if (product) {
        // Update existing product
        await updateProduct(product.id, productData);
      } else {
        // Add new product to Firebase
        await addProduct(productData);
        
        // Also create product in Shiprocket
        await createProductInShiprocket(productData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className={styles.modal}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Image Upload */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Product Image
              <span className={styles.required}>*</span>
            </label>
            <div 
              className={`${styles.imageUpload} ${isDragging ? styles.imageUploadDragging : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <div className={styles.imageUploadContent}>
                {imagePreview ? (
                  <div className={styles.imagePreview}>
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className={styles.image}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className={styles.removeButton}
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={styles.uploadText}>
                        Drag & drop an image, or click to browse
                      </p>
                      <p className={styles.uploadHint}>
                        Supports JPG, PNG up to 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Product Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Product Name
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="Enter product name"
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Description
              <span className={styles.optional}>(optional)</span>
            </label>
            <div className={styles.inputContainer}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={styles.textarea}
                placeholder="Enter product description"
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className={`${styles.grid} ${styles.formGroup}`}>
            <div>
              <label className={styles.label}>
                Price
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputContainer}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className={`${styles.input} ${styles.priceInput}`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className={styles.label}>
                Stock
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className={styles.input}
                  placeholder="Available quantity"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Category
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputContainer}>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={styles.select}
              >
                <option value="">Select a category</option>
                <option value="Mens Clothing">Men's Clothing</option>
                <option value="Womens Clothing">Women's Clothing</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Denim">Denim</option>
                <option value="Activewear">Activewear</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Bags">Bags & Backpacks</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader className={styles.spinner} size={20} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {product ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Update Product</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>Add Product</span>
                    </>
                  )}
                </>
              )}
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  </AnimatePresence>
  );
}
