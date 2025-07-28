/**
 * Filters out placeholder/category products from Shiprocket API response
 * These are generic category items with ₹0.00 price, 0 stock, and no real description
 */
export function filterRealProducts(products, includeInactive = false) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter(product => {
    const price = parseFloat(product.mrp || 0);
    const stock = parseInt(product.quantity || 0);
    const hasRealDescription = product.description && 
                              product.description !== 'No description' && 
                              product.description !== 'No description available';
    
    // List of placeholder category names that Shiprocket creates
    const placeholderCategories = [
      'Electronics', 'Clothes', 'Medicines', 'Food', 
      'Documents', 'Groceries', 'Loose Goods', 'Others'
    ];
    
    // Check if it's a placeholder/category item
    const isPlaceholder = (
      price === 0 && 
      stock === 0 && 
      !hasRealDescription &&
      placeholderCategories.includes(product.name)
    );
    
    // Check if product is active (unless we want to include inactive)
    const isActive = product.status === 'ACTIVE';
    
    // Return true for real products (not placeholders) and active products (unless specified otherwise)
    return !isPlaceholder && (includeInactive || isActive);
  });
}

/**
 * Enhanced product filtering with additional options
 */
export function filterProducts(products, options = {}) {
  const {
    excludePlaceholders = true,
    minPrice = 0,
    minStock = null,
    activeOnly = false,
    categories = []
  } = options;

  let filtered = products;

  // Filter out placeholder products
  if (excludePlaceholders) {
    filtered = filterRealProducts(filtered);
  }

  // Filter by minimum price
  if (minPrice > 0) {
    filtered = filtered.filter(product => parseFloat(product.mrp || 0) >= minPrice);
  }

  // Filter by minimum stock
  if (minStock !== null) {
    filtered = filtered.filter(product => parseInt(product.quantity || 0) >= minStock);
  }

  // Filter active products only
  if (activeOnly) {
    filtered = filtered.filter(product => product.status === 'ACTIVE');
  }

  // Filter by categories
  if (categories.length > 0) {
    filtered = filtered.filter(product => 
      categories.includes(product.category_name) || 
      categories.includes(product.category_code)
    );
  }

  return filtered;
}

/**
 * Analyzes products and returns statistics
 */
export function analyzeProducts(products) {
  const realProducts = filterRealProducts(products);
  const placeholderProducts = products.filter(p => !filterRealProducts([p]).length);

  return {
    total: products.length,
    real: realProducts.length,
    placeholders: placeholderProducts.length,
    active: realProducts.filter(p => p.status === 'ACTIVE').length,
    inactive: realProducts.filter(p => p.status === 'INACTIVE').length,
    inStock: realProducts.filter(p => parseInt(p.quantity || 0) > 0).length,
    outOfStock: realProducts.filter(p => parseInt(p.quantity || 0) === 0).length,
    totalValue: realProducts.reduce((sum, p) => sum + (parseFloat(p.mrp || 0) * parseInt(p.quantity || 0)), 0)
  };
}
