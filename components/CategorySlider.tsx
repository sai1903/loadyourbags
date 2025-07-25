
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Category } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CategorySliderProps {
    categories: Category[];
}

const CategoryItem: React.FC<{ category: Category }> = ({ category }) => (
    <NavLink to={`/category/${encodeURIComponent(category.name)}`} className="block flex-shrink-0 text-center group/item">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg transform transition-transform duration-300 group-hover/item:scale-105 mx-auto">
            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover/item:bg-opacity-40 transition-all duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center p-2">
                <h3 className="text-white text-base font-bold text-center drop-shadow-md">{category.name}</h3>
            </div>
        </div>
    </NavLink>
);

const CategorySlider: React.FC<CategorySliderProps> = ({ categories }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const isScrollable = el.scrollWidth > el.clientWidth;
            setCanScrollLeft(el.scrollLeft > 5); // A little buffer
            setCanScrollRight(isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const check = () => checkScrollability();
            el.addEventListener('scroll', check, { passive: true });
            window.addEventListener('resize', check);
            
            // Re-check after a short delay for initial render to be complete
            const timer = setTimeout(check, 100);

            return () => {
                el.removeEventListener('scroll', check);
                window.removeEventListener('resize', check);
                clearTimeout(timer);
            };
        }
    }, [checkScrollability, categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    
    if (categories.length === 0) {
        return <p className="text-slate-500 dark:text-slate-400 text-sm">No categories available.</p>;
    }

    return (
        <div className="relative group">
            {canScrollLeft && (
                <button 
                    onClick={() => scroll('left')}
                    className="absolute top-1/2 -translate-y-1/2 -left-5 w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-all duration-300 hover:scale-110 z-20"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            )}
            
            <div
                ref={scrollContainerRef}
                className="flex items-center gap-4 md:gap-8 overflow-x-auto py-4 scrollbar-hide -mx-4 px-4"
            >
                {categories.map(category => (
                    <CategoryItem key={category.name} category={category} />
                ))}
            </div>

            {canScrollRight && (
                 <button 
                    onClick={() => scroll('right')}
                    className="absolute top-1/2 -translate-y-1/2 -right-5 w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-all duration-300 hover:scale-110 z-20"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default CategorySlider;
