'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getDocs, collection, db, query, orderBy } from '../../lib/firebase';
import { Filter, Star, Heart, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
// import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import useCartStore from '../../store/cart-store';
import { formatCurrency } from '../../lib/utils';
import { brands, categories, promoCards } from '../../lib/constants';
import PromoSection from '../../components/PromoSection';
import VisualSearch from '../../components/VisualSearch';
import MarketplacePagination from '../../components/marketplace/MarketplacePagination';
import '../../static/Marketplace.css';

// Memoized ProductGrid component (moved outside main component)
const ProductGrid = memo(({ products, onViewProduct, onAddToCart }) => (
  <div className="products-grid">
    {products.map((product) => (
      <ProductCard 
        key={product.id} 
        product={product} 
        onViewProduct={onViewProduct}
        onAddToCart={onAddToCart}
      />
    ))}
  </div>
));

// Memoized ProductCard component (moved outside main component)
const ProductCard = memo(({ product, onViewProduct, onAddToCart }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="product-card"
    onClick={() => onViewProduct(product.id)}
  >
    <div className="product-card-image-container">
      <img src={product.image || '/api/placeholder/300/400'} alt={product.name} className="product-card-image" />
      <div className="product-card-actions">
        <button className="product-card-action-button">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <button className="product-card-add-to-cart" onClick={(e) => onAddToCart(e, product)}>
        Add to Cart
      </button>
    </div>
    <div className="product-card-content">
      <h3 className="product-card-name truncate">{product.name}</h3>
      <p className="product-card-description">{product.shortDescription || 'No description'}</p>
      <div className="flex items-center gap-1 mb-2">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium text-gray-700">{product.rating || '4.5'}</span>
      </div>
      <p className="product-card-price">{formatCurrency(product.price || 0)}</p>
    </div>
  </motion.div>
));


const MarketPlacePage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fashion');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [visualSearchResults, setVisualSearchResults] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  // Local UI state for filters section (expanded/collapsed)
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isBrandsExpanded, setIsBrandsExpanded] = useState(false);
  const [isSizeExpanded, setIsSizeExpanded] = useState(false);
  const [isColorExpanded, setIsColorExpanded] = useState(false);
  const [isMaterialExpanded, setIsMaterialExpanded] = useState(false);
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default: 4 per row × 3 rows
  
  // Promo carousel state
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [actualSlideIndex, setActualSlideIndex] = useState(0); // Track the actual slide (0-4)
  const totalSlides = promoCards.length; // 5 slides
  
  const { addToCart, openCart } = useCartStore();

  // Filter options based on add product form
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Navy', 'Beige'];
  const materials = ['Cotton', 'Polyester', 'Denim', 'Silk', 'Wool', 'Linen', 'Leather', 'Canvas', 'Viscose', 'Spandex', 'Nylon'];

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setItemsPerPage(4); // Mobile: 1 per row × 4 rows = 4 items
      } else if (width <= 1024) {
        setItemsPerPage(8); // Tablet: 2 per row × 4 rows = 8 items
      } else {
        setItemsPerPage(12); // Desktop: 4 per row × 3 rows = 12 items
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrands, selectedSizes, selectedColors, selectedMaterials, priceRange, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of products section
    document.querySelector('.main-content')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Auto-rotation for promo cards with infinite forward scrolling
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => {
        const nextIndex = prev + 1;
        
        // If we reach the end of original slides (index 5), reset to beginning with duplicates
        if (nextIndex >= totalSlides) {
          // Use setTimeout to reset position after animation completes
          setTimeout(() => {
            // Add no-transition class and reset to first slide
            const slidesWrapper = document.querySelector('.promo-slides-wrapper');
            if (slidesWrapper) {
              slidesWrapper.classList.add('no-transition');
              setCurrentPromoIndex(0);
              setActualSlideIndex(0);
              
              // Remove no-transition class after a brief moment to re-enable animations
              setTimeout(() => {
                slidesWrapper.classList.remove('no-transition');
              }, 50);
            }
          }, 800); // Wait for transition to complete (matches CSS transition duration)
          
          setActualSlideIndex(0); // Reset actual slide index
          return nextIndex; // Continue with the transition first
        }
        
        setActualSlideIndex(nextIndex);
        return nextIndex;
      });
    }, 5000); // Increased interval for smoother auto-rotation

    return () => clearInterval(interval);
  }, [isAutoRotating, totalSlides]);

  const nextPromo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPromoIndex((prev) => (prev + 1) % promoCards.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 8000); // Resume auto-rotation after 8 seconds for better balance
  }, []);

  const prevPromo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPromoIndex((prev) => (prev - 1 + promoCards.length) % promoCards.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 8000); // Resume auto-rotation after 8 seconds for better balance
  }, []);

  const goToPromo = useCallback((index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPromoIndex(index);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 8000); // Resume auto-rotation after 8 seconds for better balance
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const productsSnapshot = await getDocs(productsQuery);
        const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let tempProducts = [...products];

    // Category Filter
    if (selectedCategory && selectedCategory !== 'Fashion') {
      tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    }

    // Brands Filter
    if (selectedBrands.length > 0) {
      tempProducts = tempProducts.filter(p => selectedBrands.includes(p.brand));
    }

    // Size Filter
    if (selectedSizes.length > 0) {
      tempProducts = tempProducts.filter(p => {
        const productSizes = p.sizes || p.size || [];
        const sizesArray = Array.isArray(productSizes) ? productSizes : [productSizes];
        return selectedSizes.some(size => sizesArray.includes(size));
      });
    }

    // Color Filter
    if (selectedColors.length > 0) {
      tempProducts = tempProducts.filter(p => {
        const productColors = p.colors || p.color || [];
        const colorsArray = Array.isArray(productColors) ? productColors : [productColors];
        return selectedColors.some(color => 
          colorsArray.some(productColor => 
            productColor && productColor.toLowerCase() === color.toLowerCase()
          )
        );
      });
    }

    // Material Filter
    if (selectedMaterials.length > 0) {
      tempProducts = tempProducts.filter(p => {
        const productMaterials = p.materials || p.material || [];
        const materialsArray = Array.isArray(productMaterials) ? productMaterials : [productMaterials];
        return selectedMaterials.some(material => 
          materialsArray.some(productMaterial => 
            productMaterial && productMaterial.toLowerCase() === material.toLowerCase()
          )
        );
      });
    }

    // Price Range Filter
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      tempProducts = tempProducts.filter(p => {
        const price = parseFloat(p.price) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Search Filter
    if (searchTerm) {
      tempProducts = tempProducts.filter(p => {
        const searchText = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(searchText) ||
          (p.description && p.description.toLowerCase().includes(searchText)) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(searchText)) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some(tag => tag.toLowerCase().includes(searchText)))
        );
      });
    }
    
    // Sorting
    switch (sortBy) {
      case 'price-low':
        tempProducts.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-high':
        tempProducts.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'newest':
      default:
        // Already sorted by newest from Firebase query
        break;
    }

    setFilteredProducts(tempProducts);
  }, [products, searchTerm, selectedCategory, selectedBrands, selectedSizes, selectedColors, selectedMaterials, priceRange, sortBy]);

  // Memoized handlers to prevent recreation
  const handleBrandChange = useCallback((brand, checked) => {
    setSelectedBrands(prev => 
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
    );
  }, []);

  const handleSizeChange = useCallback((size, checked) => {
    setSelectedSizes(prev => 
      checked ? [...prev, size] : prev.filter(s => s !== size)
    );
  }, []);

  const handleColorChange = useCallback((color, checked) => {
    setSelectedColors(prev => 
      checked ? [...prev, color] : prev.filter(c => c !== color)
    );
  }, []);

  const handleMaterialChange = useCallback((material, checked) => {
    setSelectedMaterials(prev => 
      checked ? [...prev, material] : prev.filter(m => m !== material)
    );
  }, []);

  const handleViewProductMemo = useCallback((productId) => {
    router.push(`/marketplace/product/${productId}`);
  }, [router]);

  const handleAddToCartMemo = useCallback((e, product) => {
    e.stopPropagation();
    addToCart(product);
    openCart();
  }, [addToCart, openCart]);

  // Handler for visual search results
  const handleVisualSearchResults = useCallback((results) => {
    setVisualSearchResults(results);
    setFilteredProducts(results);
  }, []);

  // Handler for category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Function to count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'Fashion') count++;
    if (selectedBrands.length > 0) count++;
    if (selectedSizes.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (selectedMaterials.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 5000) count++;
    if (searchTerm) count++;
    return count;
  };

  // Function to clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategory('Fashion');
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setPriceRange([0, 5000]);
    setSearchTerm('');
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

    return (
    <div className="marketplace-container" style={{ paddingLeft: '2%', paddingRight: '2%' }}>
      <PromoSection 
        currentPromoIndex={currentPromoIndex}
        actualSlideIndex={actualSlideIndex}
        isAutoRotating={isAutoRotating}
        onPrev={prevPromo}
        onNext={nextPromo}
        onGoTo={goToPromo}
      />
      <div className="marketplace-body">
        <aside
          className="filter-sidebar-container"
          style={{
            width: '320px',
            flex: '0 0 320px',
            position: 'sticky',
            top: '20px', // Reduced top spacing
            height: 'fit-content',
            maxHeight: 'calc(100vh - 40px)', // Full viewport minus small margin
            zIndex: 10, // Ensure it stays above other content
            alignSelf: 'flex-start'
          }}
        >
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            padding: '12px',
            height: '100%',
            overflowY: 'auto'
          }}>
          <div style={{ marginBottom: '16px' }}>
            <VisualSearch onResults={handleVisualSearchResults} />
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ff4d6d';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 77, 109, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Clear All Filters Button */}
          {getActiveFilterCount() > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={clearAllFilters}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #ff4d6d',
                  borderRadius: '10px',
                  color: '#ff4d6d',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ff4d6d';
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.color = '#ff4d6d';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Clear All ({getActiveFilterCount()})
              </button>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ff4d6d'
              }}
            >
              <span>Category</span>
              {isCategoryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            {isCategoryExpanded && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryChange(cat)}
                        style={{
                          background: selectedCategory === cat ? 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)' : '#f8fafc',
                          color: selectedCategory === cat ? '#ffffff' : '#374151',
                          border: '1px solid',
                          borderColor: selectedCategory === cat ? '#ff4d6d' : '#e5e7eb',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: selectedCategory === cat ? 600 : 500,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedCategory !== cat) {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCategory !== cat) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3
              onClick={() => setIsBrandsExpanded(!isBrandsExpanded)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ff4d6d'
              }}
            >
              <span>Brands</span>
              {isBrandsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            {isBrandsExpanded && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '6px' }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {brands.map((brand) => {
                      const checked = selectedBrands.includes(brand);
                      return (
                        <li key={brand}>
                          <div
                            onClick={() => handleBrandChange(brand, !checked)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              background: checked ? 'rgba(255, 77, 109, 0.08)' : '#f8fafc',
                              border: '1px solid',
                              borderColor: checked ? '#ff4d6d' : '#e5e7eb',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!checked) {
                                e.currentTarget.style.background = '#f1f5f9';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!checked) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              background: checked ? '#111827' : '#ffffff',
                              border: '2px solid',
                              borderColor: checked ? '#111827' : '#cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {checked && (
                                <div style={{ width: '8px', height: '8px', background: '#ffffff', borderRadius: '2px' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '14px', color: checked ? '#111827' : '#4b5563', fontWeight: checked ? 600 : 500, flex: 1 }}>
                              {brand}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Size Filter */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              onClick={() => setIsSizeExpanded(!isSizeExpanded)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ff4d6d'
              }}
            >
              <span>Size</span>
              {isSizeExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            {isSizeExpanded && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {sizes.map((size) => {
                    const checked = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size, !checked)}
                        style={{
                          background: checked ? 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)' : '#f8fafc',
                          color: checked ? '#ffffff' : '#4b5563',
                          border: '1px solid',
                          borderColor: checked ? '#ff4d6d' : '#e5e7eb',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: checked ? 600 : 500,
                          transition: 'all 0.2s ease',
                          minWidth: '36px'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              onClick={() => setIsColorExpanded(!isColorExpanded)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ff4d6d'
              }}
            >
              <span>Color</span>
              {isColorExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            {isColorExpanded && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {colors.map((color) => {
                    const checked = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color, !checked)}
                        style={{
                          background: checked ? 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)' : '#f8fafc',
                          color: checked ? '#ffffff' : '#4b5563',
                          border: '1px solid',
                          borderColor: checked ? '#ff4d6d' : '#e5e7eb',
                          padding: '6px 10px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: checked ? 600 : 500,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Material Filter */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              onClick={() => setIsMaterialExpanded(!isMaterialExpanded)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ff4d6d'
              }}
            >
              <span>Material</span>
              {isMaterialExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            {isMaterialExpanded && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {materials.map((material) => {
                    const checked = selectedMaterials.includes(material);
                    return (
                      <button
                        key={material}
                        onClick={() => handleMaterialChange(material, !checked)}
                        style={{
                          background: checked ? 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)' : '#f8fafc',
                          color: checked ? '#ffffff' : '#4b5563',
                          border: '1px solid',
                          borderColor: checked ? '#ff4d6d' : '#e5e7eb',
                          padding: '6px 10px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: checked ? 600 : 500,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {material}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div>
            <h3
              onClick={() => setIsPriceExpanded(!isPriceExpanded)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ff4d6d'
              }}
            >
              <span>Price Range</span>
              {isPriceExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            {isPriceExpanded && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '12px',
                        flex: 1,
                        outline: 'none',
                        ':focus': {
                          borderColor: '#ff4d6d'
                        }
                      }}
                    />
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '12px',
                        flex: 1,
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '6px',
                    width: '100%'
                  }}>
                    {[{label: '<₹500', min: 0, max: 500}, {label: '₹500-1K', min: 500, max: 1000}, {label: '₹1K-2K', min: 1000, max: 2000}, {label: '₹2K+', min: 2000, max: 10000}].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setPriceRange([range.min, range.max])}
                        style={{
                          background: priceRange[0] === range.min && priceRange[1] === range.max ? 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)' : '#f8fafc',
                          color: priceRange[0] === range.min && priceRange[1] === range.max ? '#ffffff' : '#4b5563',
                          border: '1px solid',
                          borderColor: priceRange[0] === range.min && priceRange[1] === range.max ? '#ff4d6d' : '#e5e7eb',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          minWidth: 'auto',
                          width: '100%'
                        }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </aside>
        <main className="main-content">
          <div className="results-header">
            <p className="text-sm text-gray-600">Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} results</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="lg:hidden filter-toggle-btn" onClick={() => setIsFilterSidebarOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="filter-count-badge">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-white border-gray-300 hidden lg:flex">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ProductGrid 
            products={currentProducts}
            onViewProduct={handleViewProductMemo}
            onAddToCart={handleAddToCartMemo}
          />
          
          {/* Pagination Controls */}
          {!loading && filteredProducts.length > 0 && totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '40px'
            }}>
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentPage === 1 ? '#f8f9fa' : 'linear-gradient(135deg, #ff4d6d, #ff758f)',
                  color: currentPage === 1 ? '#cbd5e0' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(255, 77, 109, 0.25)'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(255, 77, 109, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.25)';
                  }
                }}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                                page === totalPages || 
                                (page >= currentPage - 1 && page <= currentPage + 1);
                
                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span
                        key={`ellipsis-${page}`}
                        style={{
                          padding: '12px 8px',
                          color: '#cbd5e0',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: currentPage === page 
                        ? 'linear-gradient(135deg, #ff4d6d, #ff758f)' 
                        : '#ffffff',
                      color: currentPage === page ? 'white' : '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: currentPage === page ? 'none' : '2px solid #e5e7eb',
                      boxShadow: currentPage === page 
                        ? '0 4px 12px rgba(255, 77, 109, 0.25)'
                        : '0 2px 8px rgba(0, 0, 0, 0.06)',
                      minWidth: '44px'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.target.style.background = 'linear-gradient(135deg, rgba(255, 77, 109, 0.1) 0%, rgba(255, 117, 143, 0.1) 100%)';
                        e.target.style.borderColor = '#ff4d6d';
                        e.target.style.color = '#ff4d6d';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.target.style.background = '#ffffff';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.color = '#6b7280';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentPage === totalPages ? '#f8f9fa' : 'linear-gradient(135deg, #ff4d6d, #ff758f)',
                  color: currentPage === totalPages ? '#cbd5e0' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(255, 77, 109, 0.25)'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(255, 77, 109, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.25)';
                  }
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {!loading && filteredProducts.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '30px',
              color: '#718096',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              {totalPages > 1 && (
                <span style={{ margin: '0 8px', color: '#cbd5e0' }}>•</span>
              )}
              {totalPages > 1 && `Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketPlacePage;