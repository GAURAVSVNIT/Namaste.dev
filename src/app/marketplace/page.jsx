'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getDocs, collection, db, query, orderBy } from '../../lib/firebase';
import { Filter, Star, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
// import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import useCartStore from '../../store/cart-store';
import { formatCurrency } from '../../lib/utils';
import { brands, categories, promoCards } from '../../lib/constants';
import PromoSection from '../../components/PromoSection';
import VisualSearch from '../../components/VisualSearch';
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
}) => (
  <aside className="filter-sidebar">
    <div className="filter-section">
      <VisualSearch onResults={onVisualSearchResults} />
    </div>
    <div className="filter-section">
      <h3>Category</h3>
      <ul>
        {categories.map(cat => (
          <li key={cat}>
            <button 
              className={selectedCategory === cat ? 'active' : ''} 
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
    <div className="filter-section">
      <h3>Brands</h3>
      <ul>
        {brands.map(brand => (
          <li key={brand} className="filter-option">
            <Checkbox 
              id={`brand-${brand}`} 
              onCheckedChange={(checked) => onBrandChange(brand, checked)}
              checked={selectedBrands.includes(brand)}
            />
            <label htmlFor={`brand-${brand}`}>{brand}</label>
          </li>
        ))}
      </ul>
      <a href="#" className="text-sm text-blue-600 mt-3 inline-block">See more</a>
    </div>
  </aside>
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
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [visualSearchResults, setVisualSearchResults] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  
  // Promo carousel state
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  const { addToCart, openCart } = useCartStore();

  // Auto-rotation for promo cards
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoCards.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const nextPromo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPromoIndex((prev) => (prev + 1) % promoCards.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 10000); // Resume auto-rotation after 10 seconds
  }, []);

  const prevPromo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPromoIndex((prev) => (prev - 1 + promoCards.length) % promoCards.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 10000); // Resume auto-rotation after 10 seconds
  }, []);

  const goToPromo = useCallback((index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPromoIndex(index);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 10000); // Resume auto-rotation after 10 seconds
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
    <div className="marketplace-container">
      <div className="marketplace-content-wrapper">
        <PromoSection 
          currentPromoIndex={currentPromoIndex}
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
              <p className="text-sm text-gray-600">Showing {filteredProducts.length} of {products.length} results</p>
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
              products={filteredProducts}
              onViewProduct={handleViewProductMemo}
              onAddToCart={handleAddToCartMemo}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MarketPlacePage;