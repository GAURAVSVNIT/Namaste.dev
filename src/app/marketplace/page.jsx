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

// Memoized FilterSidebar component (moved outside main component)
const FilterSidebar = memo(({ 
  categories, 
  brands, 
  selectedCategory, 
  selectedBrands, 
  onCategoryChange, 
  onBrandChange, 
  onVisualSearchResults 
}) => {
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isBrandsExpanded, setIsBrandsExpanded] = useState(false);

  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <VisualSearch onResults={onVisualSearchResults} />
      </div>
      
      {/* Category Section */}
      <div className="filter-section">
        <h3 
          onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            margin: '0 0 1.25rem 0',
            fontSize: '0.95rem',
            fontWeight: '800',
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 77, 109, 0.1)',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(255, 77, 109, 0.1)'
          }}>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={selectedCategory === cat ? 'active' : ''} 
                    onClick={() => onCategoryChange(cat)}
                    style={{
                      background: selectedCategory === cat ? 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)' : 'rgba(248, 250, 252, 0.8)',
                      color: selectedCategory === cat ? 'white' : '#495057',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: selectedCategory === cat ? '600' : '500',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedCategory === cat ? '0 2px 8px rgba(255, 77, 109, 0.3)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (selectedCategory !== cat) {
                        e.target.style.backgroundColor = 'rgba(255, 77, 109, 0.1)';
                        e.target.style.color = '#ff4d6d';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedCategory !== cat) {
                        e.target.style.backgroundColor = 'rgba(248, 250, 252, 0.8)';
                        e.target.style.color = '#495057';
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
      
      {/* Brands Section */}
      <div className="filter-section">
        <h3 
          onClick={() => setIsBrandsExpanded(!isBrandsExpanded)}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            margin: '0 0 1.25rem 0',
            fontSize: '0.95rem',
            fontWeight: '800',
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 77, 109, 0.1)',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(255, 77, 109, 0.1)'
          }}>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {brands.map(brand => (
                  <li key={brand}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.55rem',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        backgroundColor: selectedBrands.includes(brand) ? 'rgba(255, 77, 109, 0.1)' : 'rgba(248, 250, 252, 0.6)',
                        border: selectedBrands.includes(brand) ? '2px solid #ff4d6d' : '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: selectedBrands.includes(brand) ? '0 2px 8px rgba(255, 77, 109, 0.2)' : 'none'
                      }}
                      onClick={() => onBrandChange(brand, !selectedBrands.includes(brand))}
                      onMouseOver={(e) => {
                        if (!selectedBrands.includes(brand)) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 77, 109, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 77, 109, 0.3)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedBrands.includes(brand)) {
                          e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.6)';
                          e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                        }
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: selectedBrands.includes(brand) ? '#ff4d6d' : 'transparent',
                        border: selectedBrands.includes(brand) ? '2px solid #ff4d6d' : '2px solid #cbd5e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {selectedBrands.includes(brand) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: selectedBrands.includes(brand) ? '600' : '500',
                        color: selectedBrands.includes(brand) ? '#ff4d6d' : '#64748b',
                        flex: 1,
                        transition: 'all 0.2s ease'
                      }}>
                        {brand}
                      </span>
                      {selectedBrands.includes(brand) && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#ff4d6d'
                        }} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
});

const MarketPlacePage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fashion');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [visualSearchResults, setVisualSearchResults] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default: 4 per row × 3 rows
  
  // Promo carousel state
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [actualSlideIndex, setActualSlideIndex] = useState(0); // Track the actual slide (0-4)
  const totalSlides = promoCards.length; // 5 slides
  
  const { addToCart, openCart } = useCartStore();

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
  }, [searchTerm, selectedCategory, selectedBrands, sortBy]);

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

    // Search Filter
    if (searchTerm) {
      tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Sorting
    switch (sortBy) {
      case 'price-low':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        // Already sorted by newest from Firebase query
        break;
    }

    setFilteredProducts(tempProducts);
  }, [products, searchTerm, selectedCategory, selectedBrands, sortBy]);

  // Memoized handlers to prevent recreation
  const handleBrandChange = useCallback((brand, checked) => {
    setSelectedBrands(prev => 
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
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
    if (searchTerm) count++;
    return count;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

    return (
    <div className="marketplace-container" style={{ paddingLeft: '8%', paddingRight: '8%' }}>
      <PromoSection 
        currentPromoIndex={currentPromoIndex}
        actualSlideIndex={actualSlideIndex}
        isAutoRotating={isAutoRotating}
        onPrev={prevPromo}
        onNext={nextPromo}
        onGoTo={goToPromo}
      />
      <div className="marketplace-body">
        <FilterSidebar 
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrands={selectedBrands}
          onCategoryChange={handleCategoryChange}
          onBrandChange={handleBrandChange}
          onVisualSearchResults={handleVisualSearchResults}
        />
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