
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { NavLink } from 'react-router-dom';
import { HeartIcon } from '../components/Icons';

const WishlistPage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const wishlistIds = user?.wishlist || [];
    
    const fetchWishlistProducts = useCallback(() => {
        if (wishlistIds.length > 0) {
            setIsLoading(true);
            setError(null);
            apiService.fetchProductsByIds(wishlistIds)
                .then(setProducts)
                .catch(err => {
                    console.error("Failed to fetch wishlist products", err);
                    setError("We couldn't load your wishlist at the moment. Please try again later.");
                })
                .finally(() => setIsLoading(false));
        } else {
            setProducts([]);
            setIsLoading(false);
            setError(null);
        }
    }, [JSON.stringify(wishlistIds)]); // Stable dependency for the callback

    useEffect(() => {
        fetchWishlistProducts();
    }, [fetchWishlistProducts]);

    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                    {Array.from({ length: wishlistIds.length || 4 }).map((_, i) => (
                         <div key={i} className="bg-slate-200 dark:bg-slate-700 rounded-lg h-96"></div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                 <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md border border-red-200 dark:border-red-800">
                    <h2 className="mt-6 text-2xl font-bold text-red-800 dark:text-red-200">Something Went Wrong</h2>
                    <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
                    <button
                        onClick={fetchWishlistProducts}
                        className="mt-6 inline-block bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-red-700 transition-transform transform hover:scale-105"
                    >
                      Try Again
                    </button>
                </div>
            );
        }

        if (products.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <HeartIcon className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600" />
                <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-200">Your Wishlist is Empty</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Click the heart on any product to save it here.</p>
                <NavLink
                  to="/"
                  className="mt-6 inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
                >
                  Discover Products
                </NavLink>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Wishlist</h1>
            {renderContent()}
        </div>
    );
};

export default WishlistPage;
