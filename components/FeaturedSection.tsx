
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Product } from '../types';
import { StarIcon, UsersIcon } from './Icons';

const FeaturedSection: React.FC<{ products: Product[] }> = ({ products }) => {
    
    const getAverageRating = (p: Product) => p.reviews.length > 0 ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) : 0;

    // Data for the first row
    const topSelectionProducts = useMemo(() => {
        return products.slice(0, 4);
    }, [products]);

    const topRatedProducts = useMemo(() => {
        return [...products].sort((a, b) => getAverageRating(b) - getAverageRating(a)).slice(0, 3);
    }, [products]);

    const offerProduct = useMemo(() => {
        return products.find(p => p.onSale) || (products.length > 1 ? products[1] : null);
    }, [products]);

    // Data for the second row
    const newArrival = useMemo(() => {
        return products.length > 0 ? products[products.length - 1] : null;
    }, [products]);

    const trialProductHighlight = useMemo(() => {
        return products.find(p => p.isTrialAvailable && p.category === 'Music') || products.find(p => p.isTrialAvailable);
    }, [products]);

    const mostPopularProducts = useMemo(() => {
        return [...products].sort((a, b) => b.reviews.length - a.reviews.length).slice(0, 3);
    }, [products]);


    if (!products.length || !offerProduct || !newArrival || !trialProductHighlight) {
        return null;
    }

    return (
        <div className="space-y-8 md:space-y-12">
            {/* First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1: Top Selection Grid */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Top Selection</h3>
                    <div className="grid grid-cols-2 gap-4 flex-grow">
                        {topSelectionProducts.map(product => (
                            <NavLink to={`/product/${product.id}`} key={product.id} className="block group rounded-lg overflow-hidden relative aspect-square">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-2">
                                    <p className="text-white text-sm font-semibold drop-shadow-md leading-tight">{product.name}</p>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Card 2: Top Rated Products */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Top Rated</h3>
                    <div className="space-y-4 flex-grow">
                        {topRatedProducts.map(product => (
                            <NavLink to={`/product/${product.id}`} key={product.id} className="flex items-center gap-4 group p-2 -m-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition-colors">{product.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <StarIcon className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{getAverageRating(product).toFixed(1)}</span>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Card 3: Offer of the Day */}
                <NavLink to={`/product/${offerProduct.id}`} className="lg:col-span-1 bg-cover bg-center rounded-xl shadow-lg group relative overflow-hidden min-h-[300px] flex flex-col justify-end text-white p-6" style={{ backgroundImage: `url(${offerProduct.imageUrl})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-all duration-300 group-hover:from-black/80"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Offer of the day</h3>
                        <p className="text-3xl font-extrabold mt-1 drop-shadow-lg">{offerProduct.name}</p>
                        <div className="mt-4 inline-block bg-primary-600 text-white font-bold py-2 px-4 rounded-md shadow-md group-hover:bg-primary-500 transition-transform transform group-hover:scale-105">
                            Shop Now
                        </div>
                    </div>
                </NavLink>
            </div>

             {/* Second Row */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1: New Arrival */}
                <NavLink to={`/product/${newArrival.id}`} className="lg:col-span-1 bg-cover bg-center rounded-xl shadow-lg group relative overflow-hidden min-h-[300px] flex flex-col justify-end text-white p-6" style={{ backgroundImage: `url(${newArrival.imageUrl})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent transition-all duration-300 group-hover:from-slate-900/70"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">New Arrival</h3>
                        <p className="text-3xl font-extrabold mt-1 drop-shadow-lg">{newArrival.name}</p>
                        <div className="mt-4 inline-block bg-white text-slate-800 font-bold py-2 px-4 rounded-md shadow-md group-hover:bg-slate-200 transition-transform transform group-hover:scale-105">
                            Check it out
                        </div>
                    </div>
                </NavLink>
                
                 {/* Card 2: Most Popular Products */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Most Popular</h3>
                    <div className="space-y-4 flex-grow">
                        {mostPopularProducts.map(product => (
                            <NavLink to={`/product/${product.id}`} key={product.id} className="flex items-center gap-4 group p-2 -m-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition-colors">{product.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <UsersIcon className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{product.reviews.length} reviews</span>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Card 3: Try at home */}
                <NavLink to={`/product/${trialProductHighlight.id}`} className="lg:col-span-1 bg-cover bg-center rounded-xl shadow-lg group relative overflow-hidden min-h-[300px] flex flex-col justify-end text-white p-6" style={{ backgroundImage: `url(${trialProductHighlight.imageUrl})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-800/30 to-transparent transition-all duration-300 group-hover:from-blue-900/70"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Try Before you buy</h3>
                        <p className="text-3xl font-extrabold mt-1 drop-shadow-lg">{trialProductHighlight.name}</p>
                        <div className="mt-4 inline-block bg-primary-600 text-white font-bold py-2 px-4 rounded-md shadow-md group-hover:bg-primary-500 transition-transform transform group-hover:scale-105">
                           Learn More
                        </div>
                    </div>
                </NavLink>
            </div>
        </div>
    );
};

export default FeaturedSection;