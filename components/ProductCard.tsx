
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Product, UserRole } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBagIcon, HeartIcon, StarIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user, isProductInWishlist, toggleWishlist } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    // Optionally add a toast notification here
  };
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };
  
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/category/${encodeURIComponent(product.category)}`);
  };

  const inWishlist = isProductInWishlist(product.id);
  
  const reviewCount = product.reviews.length;
  const averageRating = reviewCount > 0
    ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
    : 'N/A';


  return (
    <NavLink to={`/product/${product.id}`} className="group block h-full">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl relative flex flex-col h-full">
        <div className="relative">
            <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {product.onSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</div>
            )}
            {user?.role === UserRole.CUSTOMER && (
                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-red-500 hover:text-red-600 hover:scale-110 transition-all duration-200"
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <HeartIcon filled={inWishlist} className="w-6 h-6" />
                </button>
            )}
            <button 
                onClick={handleAddToCart}
                className="absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300 ease-in-out hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Add to cart"
            >
                <ShoppingBagIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
           <p
            onClick={handleCategoryClick}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1 hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors cursor-pointer"
           >
            {product.category}
           </p>
          <div className="flex-grow"></div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ₹{product.retailPrice.toLocaleString('en-IN')}
                </p>
                {product.onSale && product.mrp && (
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500 line-through">
                        ₹{product.mrp.toLocaleString('en-IN')}
                    </p>
                )}
            </div>
             <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{averageRating} ({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

export default ProductCard;
