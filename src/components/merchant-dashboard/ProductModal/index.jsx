'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader } from 'lucide-react';
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white  rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white  p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 ">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100  rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-32">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-200  rounded-lg flex items-center justify-center">
                  <Upload size={32} className="text-gray-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white "
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-white "
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                required
                className="w-full px-4 py-2 border rounded-lg bg-white  "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg bg-white "
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg bg-white "
            >
              <option value="">Select a category</option>
              <option value="Mens Clothing">Mens Clothing</option>
              <option value="Womens Clothing">Womens Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
              <option value="Denim">Denim</option>
              <option value="Activewear">Activewear</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Bags">Bags</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
