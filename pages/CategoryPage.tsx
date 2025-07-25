
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product, ApprovalStatus } from '../types';
import apiService from '../services/apiService';
import { ShoppingBagIcon } from '../components/Icons';

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [allApprovedProducts, setAllApprovedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';

  useEffect(() => {
    const fetchProductsForCategory = async () => {
      setIsLoading(true);
      try {
        // API now only returns approved products
        const products = await apiService.fetchProducts();
        setAllApprovedProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsForCategory();
  }, []);

  const categoryProducts = useMemo(() => {
    if (!decodedCategoryName) return [];
    return allApprovedProducts.filter(p => p.category.toLowerCase() === decodedCategoryName.toLowerCase());
  }, [allApprovedProducts, decodedCategoryName]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-slate-200 dark:bg-slate-700 h-10 w-1/3 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 rounded-lg h-96"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
        {decodedCategoryName}
      </h1>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-md">
          <ShoppingBagIcon className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600" />
          <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-200">No Products Found</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">There are currently no products in the "{decodedCategoryName}" category.</p>
          <NavLink
            to="/"
            className="mt-6 inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
          >
            Explore Other Products
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
