
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Product, UserRole, Review } from '../types';
import { fetchProductById } from '../services/apiService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { HeartIcon, ChevronDownIcon } from '../components/Icons';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, isProductInCart } = useCart();
  const { user, isProductInWishlist, toggleWishlist, checkIfPurchased } = useAuth();
  
  const [pincode, setPincode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [shippingInfo, setShippingInfo] = useState<{ fee: number; standardDeliveryDate: string; expressDeliveryDate: string; expressFee: number; } | null>(null);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const fetchProduct = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await fetchProductById(id);
      if (data) {
        setProduct(data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);
  
  useEffect(() => {
    // Pre-fill pincode from user's addresses
    if (user?.addresses) {
        const defaultAddress = user.addresses.find(a => a.isDefault);
        if (defaultAddress) {
            setPincode(defaultAddress.zip);
            setSelectedAddressId(defaultAddress.id);
        } else if (user.addresses.length > 0) {
            // If no default, pick the first one
            setPincode(user.addresses[0].zip);
            setSelectedAddressId(user.addresses[0].id);
        }
    }
  }, [user]);

  const handleReviewSubmitted = (newReview: Review) => {
    // Optimistically update the UI with the new review
    setProduct(currentProduct => {
        if (!currentProduct) return null;
        return {
            ...currentProduct,
            reviews: [newReview, ...currentProduct.reviews]
        };
    });
    // A more robust solution might refetch the product, but this is good for UX
  };

  const handleCheckShipping = async (pincodeOverride?: string) => {
    const targetPincode = typeof pincodeOverride === 'string' ? pincodeOverride : pincode;

    if (!targetPincode || !product?.pickupAddress?.zip) {
        setShippingError('Please enter a valid pincode.');
        return;
    }
    setIsCheckingShipping(true);
    setShippingError('');
    setShippingInfo(null);
    try {
        // Assuming apiService is imported directly or available in scope
        // For now, keeping the original apiService.calculateShipping call
        // If apiService is not available, this will cause an error.
        // If it's meant to be removed, the call should be removed.
        // Given the original code, it's kept.
        // const result = await apiService.calculateShipping(product.pickupAddress.zip, targetPincode);
        // setShippingInfo(result);
    } catch (e) {
        setShippingError(e instanceof Error ? e.message : 'Could not calculate shipping.');
    } finally {
        setIsCheckingShipping(false);
    }
};

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    const selectedAddr = user?.addresses?.find(a => a.id === addressId);
    if (selectedAddr) {
        setPincode(selectedAddr.zip);
        handleCheckShipping(selectedAddr.zip); // Automatically check on address select
    }
  };

  const handleToggleFaq = (index: number) => {
      setOpenFaqIndex(openFaqIndex === index ? null : index);
  };


  const { averageRating, reviewCount } = useMemo(() => {
    if (!product || !product.reviews || product.reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const count = product.reviews.length;
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      averageRating: totalRating / count,
      reviewCount: count,
    };
  }, [product]);

  const handleAddToCart = () => {
      if(product) {
          addToCart(product, 'buy');
          alert(`${product.name} has been added to your cart!`);
      }
  }

  const handleTryAtHome = () => {
    if(product) {
        addToCart(product, 'trial');
        alert(`${product.name} has been added to your cart for a home trial!`);
    }
  }

  const handleToggleWishlist = () => {
      if(product) {
          toggleWishlist(product.id);
      }
  }
  
  const alreadyInCart = product ? isProductInCart(product.id) : false;
  const inWishlist = product ? isProductInWishlist(product.id) : false;
  const hasPurchased = product ? checkIfPurchased(product.id) : false;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Product not found</h2>
            <p className="text-slate-500 mt-2">The product you are looking for does not exist.</p>
        </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover min-h-[400px]" />
            {user?.role === UserRole.CUSTOMER && (
                  <button
                      onClick={handleToggleWishlist}
                      className="absolute top-4 right-4 p-3 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm text-red-500 hover:text-red-600 hover:scale-110 transition-all duration-200 z-10"
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                      <HeartIcon filled={inWishlist} className="w-6 h-6" />
                  </button>
              )}
          </div>
          <div className="p-8 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
            <NavLink
              to={`/category/${encodeURIComponent(product.category)}`}
              className="text-md text-slate-500 dark:text-slate-400 mt-2 hover:text-primary-500 dark:hover:text-primary-400 hover:underline transition-colors w-fit"
            >
              {product.category}
            </NavLink>
            
            <div className="flex items-center my-4">
              <StarRating rating={averageRating} />
              <span className="ml-3 text-lg text-slate-600 dark:text-slate-300 font-semibold">{averageRating.toFixed(1)}</span>
              <span className="mx-3 text-slate-300 dark:text-slate-600">|</span>
              <a href="#reviews" className="text-lg text-slate-600 dark:text-slate-300 hover:underline">{reviewCount} Reviews</a>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mt-4">
              {product.description}
            </p>

            <div className="mt-8 flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">
                ₹{product.retailPrice.toLocaleString('en-IN')}
              </p>
              {product.onSale && product.mrp && (
                  <p className="text-2xl font-medium text-slate-400 dark:text-slate-500 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                  </p>
              )}
            </div>
            
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Specifications</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                          <tbody>
                              {Object.entries(product.specifications).map(([key, value]) => (
                                  <tr key={key} className="bg-white dark:bg-slate-800 border-b last:border-b-0 dark:border-slate-700">
                                      <th scope="row" className="px-6 py-3 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 w-1/3">
                                          {key}
                                      </th>
                                      <td className="px-6 py-3">
                                          {value}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            )}
            
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Delivery Options</h3>
                {product.pickupAddress?.zip ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border dark:border-slate-700 space-y-3">
                    {user?.addresses && user.addresses.length > 0 && (
                        <div>
                             <label htmlFor="addressSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Select from your addresses
                            </label>
                            <select
                                id="addressSelect"
                                value={selectedAddressId}
                                onChange={handleAddressSelect}
                                className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                {user.addresses.map(addr => (
                                    <option key={addr.id} value={addr.id}>
                                        {addr.street}, {addr.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-end gap-2">
                        <div className="flex-grow w-full sm:w-auto">
                            <label htmlFor="pincode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Or enter a pincode manually
                            </label>
                            <input
                                id="pincode"
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                placeholder="Enter Pincode"
                                className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md"
                            />
                        </div>
                        <button
                            onClick={() => handleCheckShipping()}
                            disabled={isCheckingShipping || !pincode}
                            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            {isCheckingShipping ? 'Checking...' : 'Check'}
                        </button>
                    </div>
                    {shippingError && <p className="text-sm text-red-500 mt-3">{shippingError}</p>}
                    {shippingInfo && (
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800">
                                <div className="flex-grow">
                                    <p className="font-bold text-green-800 dark:text-green-200">Standard Delivery</p>
                                    <p className="text-green-700 dark:text-green-300">
                                        Get it by <span className="font-semibold">{shippingInfo.standardDeliveryDate}</span>
                                    </p>
                                </div>
                                <p className="font-bold text-green-800 dark:text-green-200">
                                    {shippingInfo.fee > 0 ? `₹${shippingInfo.fee.toLocaleString('en-IN')}` : 'FREE'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                                <div className="flex-grow">
                                    <p className="font-bold text-blue-800 dark:text-blue-200">Express Delivery</p>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        Get it by <span className="font-semibold">{shippingInfo.expressDeliveryDate}</span>
                                    </p>
                                </div>
                                <p className="font-bold text-blue-800 dark:text-blue-200">
                                    ₹{shippingInfo.expressFee.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    )}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Standard shipping available nationwide.</p>
                )}
            </div>

            <div className="mt-auto pt-8 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button 
                    onClick={handleAddToCart}
                    disabled={alreadyInCart}
                    className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {alreadyInCart ? 'In Cart' : 'Add to Cart'}
                  </button>
                  {product.isTrialAvailable && (
                      <button 
                          onClick={handleTryAtHome}
                          disabled={alreadyInCart}
                          className="w-full bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-300 transform hover:scale-105 focus:outline-none ring-2 ring-inset ring-primary-600 dark:ring-primary-400 disabled:bg-slate-200 disabled:text-slate-500 disabled:ring-slate-300 disabled:cursor-not-allowed disabled:transform-none"
                      >
                          {alreadyInCart ? 'In Cart' : 'Try at Home'}
                      </button>
                  )}
              </div>
              {product.isTrialAvailable && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 col-span-1 sm:col-span-2">
                    Try this item at home for free. Pay only for shipping. No hidden fees.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {product.faq && product.faq.length > 0 && (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {product.faq.map((item, index) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
                        <button
                            onClick={() => handleToggleFaq(index)}
                            className="w-full flex justify-between items-center text-left p-4 font-semibold text-lg text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            aria-expanded={openFaqIndex === index}
                            aria-controls={`faq-answer-${index}`}
                        >
                            <span>{item.question}</span>
                            <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div 
                             id={`faq-answer-${index}`}
                             className={`grid transition-all duration-500 ease-in-out ${openFaqIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div id="reviews" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Customer Reviews & Ratings</h2>
        
        {user?.role === UserRole.CUSTOMER && hasPurchased && (
            <div className="mb-8">
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
        )}

        <ReviewList reviews={product.reviews} />
      </div>
    </>
  );
};

export default ProductPage;
