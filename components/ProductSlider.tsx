
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import ProductCard from './ProductCard';

interface ProductSliderProps {
    products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const isScrollable = el.scrollWidth > el.clientWidth;
            setCanScrollLeft(el.scrollLeft > 5);
            setCanScrollRight(isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const check = () => checkScrollability();
            el.addEventListener('scroll', check, { passive: true });
            window.addEventListener('resize', check);
            
            const timer = setTimeout(check, 100);

            return () => {
                el.removeEventListener('scroll', check);
                window.removeEventListener('resize', check);
                clearTimeout(timer);
            };
        }
    }, [checkScrollability, products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    
    if (!products.length) return null;

    return (
        <div className="relative group/slider">
            <button 
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="absolute top-1/2 -translate-y-1/2 -left-5 w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 z-20"
                aria-label="Scroll left"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            <div
                ref={scrollContainerRef}
                className="flex items-stretch gap-6 overflow-x-auto py-4 scrollbar-hide -mx-4 px-4"
            >
                {products.map(product => (
                     <div key={product.id} className="flex-shrink-0 w-[280px]">
                        <ProductCard product={product} />
                     </div>
                ))}
            </div>

            <button 
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="absolute top-1/2 -translate-y-1/2 -right-5 w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 z-20"
                aria-label="Scroll right"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ProductSlider;
