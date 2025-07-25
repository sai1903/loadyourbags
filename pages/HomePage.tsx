
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product, Category, ApprovalStatus } from '../types';
import { fetchProducts, fetchCategories } from '../services/apiService';
import HeroSlider from '../components/HeroSlider';
import CategorySlider from '../components/CategorySlider';
import ProductSlider from '../components/ProductSlider';
import FilterBar from '../components/FilterBar';
import FeaturedSection from '../components/FeaturedSection';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchParams] = useSearchParams();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [productData, categoryData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        setProducts(productData);
        setCategories(categoryData);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);
  
  useEffect(() => {
    // Sync search term with URL query parameter
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);
  
  const allColors = useMemo(() => {
    const colors = products.flatMap((p: Product) => p.colors);
    return [...new Set(colors)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((p: Product) => 
        p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.colors.some((c: string) => c.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
        filtered = filtered.filter((p: Product) => selectedCategories.includes(p.category));
    }

    // Color filter
    if (selectedColors.length > 0) {
        filtered = filtered.filter((p: Product) => p.colors.some((c: string) => selectedColors.includes(c)));
    }
    
    // Price filter
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);
    if (!isNaN(minPrice)) {
        filtered = filtered.filter((p: Product) => p.retailPrice >= minPrice);
    }
    if (!isNaN(maxPrice)) {
        filtered = filtered.filter((p: Product) => p.retailPrice <= maxPrice);
    }

    // Sorting
    switch (sortOrder) {
      case 'price-asc':
        filtered.sort((a: Product, b: Product) => a.retailPrice - b.retailPrice);
        break;
      case 'price-desc':
        filtered.sort((a: Product, b: Product) => b.retailPrice - a.retailPrice);
        break;
      case 'name-asc':
        filtered.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a: Product, b: Product) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, sortOrder, priceRange, selectedCategories, selectedColors]);
  
  const productsByCategory = useMemo(() => {
    return products.reduce((acc: Record<string, Product[]>, product: Product) => {
        const category = product.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const onSaleProducts = useMemo(() => products.filter((p: Product) => p.onSale), [products]);

  const isFiltering = useMemo(() => {
    return searchTerm || selectedCategories.length > 0 || selectedColors.length > 0 || priceRange.min || priceRange.max;
  }, [searchTerm, selectedCategories, selectedColors, priceRange]);
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm(''); // This will not clear the URL, but the local filters
    setSortOrder('default');
    setPriceRange({ min: '', max: '' });
    setSelectedCategories([]);
    setSelectedColors([]);
     // If you want to clear the URL as well:
     // navigate('/'); 
  }, []);
  
  if (isLoading) {
    return (
        <div className="space-y-8 animate-pulse">
             <div className="w-full h-96 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
             <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
             <div className="flex items-center gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 w-32 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                ))}
             </div>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      {!isFiltering && (
        <>
          <HeroSlider />
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-200">Shop by Category</h2>
              <CategorySlider categories={categories} />
            </div>
            <FeaturedSection products={products} />
          </div>
        </>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pt-8">
        {/* Left Column - Filters */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="lg:hidden mb-4">
                 <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Filters</h2>
            </div>
            <FilterBar 
                categories={categories}
                allColors={allColors}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                onClearFilters={handleClearFilters}
                isFiltering={!!isFiltering}
            />
        </div>

        {/* Right Column - Products */}
        <div className="lg:col-span-3">
             {isFiltering ? (
                 <div>
                    <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-200">
                        Search Results ({filteredAndSortedProducts.length})
                    </h2>
                    {filteredAndSortedProducts.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            {filteredAndSortedProducts.map((product: Product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-slate-600 dark:text-slate-400">No products found matching your criteria.</p>
                        </div>
                    )}
                 </div>
              ) : (
                <div className="space-y-12">
                    {onSaleProducts.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 md:p-8 rounded-xl">
                            <h2 className="text-3xl font-bold mb-1 text-red-600 dark:text-red-400">Offer Zone</h2>
                            <ProductSlider products={onSaleProducts} />
                        </div>
                    )}

                    {Object.entries(productsByCategory).map(([category, catProducts]: [string, Product[]]) => (
                        catProducts.length > 0 && (
                            <div key={category}>
                                <h2 className="text-3xl font-bold mb-1 text-slate-800 dark:text-slate-200">{category}</h2>
                                <ProductSlider products={catProducts} />
                            </div>
                        )
                    ))}
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
